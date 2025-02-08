// booked-listing.component.ts
import { Component, effect, inject, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { BookingService } from "../service/booking.service";
import { ToastService } from "../../layout/toast.service";
import { BookedListing } from "../model/booking.model";
import { CardListingComponent } from "../../shared/card-listing/card-listing.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {CurrencyPipe} from "@angular/common";

@Component({
  selector: 'app-booked-listing',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent,
    CurrencyPipe
  ],
  templateUrl: './booked-listing.component.html',
  styleUrl: './booked-listing.component.scss'
})
export class BookedListingComponent implements OnInit, OnDestroy {
  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  bookedListings = new Array<BookedListing>();

  loading = false;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  showPaymentForm = false;
  selectedBooking: BookedListing | null = null;
  paymentProcessing = false;

  constructor() {
    this.listenFetchBooking();
    this.listenCancelBooking();
  }

  async ngOnInit() {
    await this.initializeStripe();
    this.fetchBooking();
  }

  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }

  private fetchBooking() {
    this.loading = true;
    this.bookingService.getBookedListing();
  }

  onCancelBooking(bookedListing: BookedListing) {
    bookedListing.loading = true;
    this.bookingService.cancel(bookedListing.bookingPublicId, bookedListing.listingPublicId, false);
  }

  private listenFetchBooking() {
    effect(() => {
      const bookedListingsState = this.bookingService.getBookedListingSig();
      if (bookedListingsState.status === "OK") {
        this.loading = false;
        this.bookedListings = bookedListingsState.value!;
      } else if (bookedListingsState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when fetching the listing",
        });
      }
    });
  }

  private listenCancelBooking() {
    effect(() => {
      const cancelState = this.bookingService.cancelSig();
      if (cancelState.status === "OK") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings.splice(listingToDeleteIndex, 1);
        this.toastService.send({
          severity: "success", summary: "Successfully cancelled booking",
        });
      } else if (cancelState.status === "ERROR") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings[listingToDeleteIndex].loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when cancel your booking",
        });
      }
    });
  }

  private async initializeStripe() {
    this.stripe = await loadStripe('pk_test_51OtdAyGmXNQGydzP913niVXoymwGsHLrlllPlvqx2fcP96HMGtgp8vHs4wTPuvXtl5yD9SEBjAI6EjrEJIjdCjuh00GtozZgkO');
    if (!this.stripe) {
      this.toastService.send({
        severity: "error",
        summary: "Failed to initialize payment system"
      });
    }
  }

  async onPay(bookedListing: BookedListing) {
    if (!this.stripe) {
      this.toastService.send({
        severity: "error",
        summary: "Payment system not initialized"
      });
      return;
    }

    this.selectedBooking = bookedListing;
    this.showPaymentForm = true;

    try {
      this.elements = this.stripe.elements();
      const card = this.elements.create('card');

      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
          card.mount('#card-element');
        }
      }, 0);
    } catch (error) {
      console.error('Error creating card element:', error);
      this.toastService.send({
        severity: "error",
        summary: "Failed to initialize payment form"
      });
    }
  }

  async submitPayment() {
    if (!this.stripe || !this.elements || !this.selectedBooking) {
      this.toastService.send({
        severity: "error",
        summary: "Payment system not initialized properly"
      });
      return;
    }

    this.paymentProcessing = true;

    try {
      // Get client secret from backend
      const clientSecret = await this.bookingService
        .createPaymentIntent(this.selectedBooking.bookingPublicId, this.selectedBooking.totalPrice)
        .toPromise();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm the payment
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.elements.getElement('card')!,
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Payment successful - update booking status
      await this.bookingService
        .updatePaymentStatus(this.selectedBooking.bookingPublicId, 'PAID')
        .toPromise();

      this.selectedBooking.paymentStatus = 'PAID';
      this.showPaymentForm = false;
      this.toastService.send({
        severity: "success",
        summary: "Payment successful"
      });
    } catch (error: any) {
      this.toastService.send({
        severity: "error",
        summary: error.message || "Payment failed"
      });
    } finally {
      this.paymentProcessing = false;
    }
  }
}
