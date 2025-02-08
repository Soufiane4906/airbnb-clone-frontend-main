// navbar.component.ts
import { Component, effect, inject, OnInit } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { ButtonModule } from "primeng/button";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ToolbarModule } from "primeng/toolbar";
import { MenuModule } from "primeng/menu";
import { CarouselModule } from 'primeng/carousel';
import { CategoryComponent } from "./category/category.component";
import { AvatarComponent } from "./avatar/avatar.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { MenuItem } from "primeng/api";
import { ToastService } from "../toast.service";
import { AuthService } from "../../core/auth/auth.service";
import { User } from "../../core/model/user.model";
import { PropertiesCreateComponent } from "../../landlord/properties-create/properties-create.component";
import { SearchComponent } from "../../tenant/search/search.component";
import { ActivatedRoute } from "@angular/router";
import dayjs from "dayjs";

interface City {
  name: string;
  image: string;
  description: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    FontAwesomeModule,
    ToolbarModule,
    MenuModule,
    CarouselModule,
    CategoryComponent,
    AvatarComponent,
  ],
  providers: [DialogService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  location = "Anywhere";
  guests = "Add guests";
  dates = "Any week";

  toastService = inject(ToastService);
  authService = inject(AuthService);
  dialogService = inject(DialogService);
  activatedRoute = inject(ActivatedRoute);
  ref: DynamicDialogRef | undefined;

  login = () => this.authService.login();

  logout = () => this.authService.logout();

  currentMenuItems: MenuItem[] | undefined = [];

  connectedUser: User = {email: this.authService.notConnected};


  constructor(public router: Router) {
    effect(() => {
      if (this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });
  }

  ngOnInit(): void {
    this.authService.fetch(false);
    this.extractInformationForSearch();
  }

  private fetchMenu(): MenuItem[] {
    if (this.authService.isAuthenticated()) {
      return [
        {
          label: "My properties",
          routerLink: "landlord/properties",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "My booking",
          routerLink: "booking",
        },
        {
          label: "My reservation",
          routerLink: "landlord/reservation",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "Log out",
          command: this.logout
        },
      ]
    } else {
      return [
        {
          label: "Sign up",
          styleClass: "font-bold",
          command: this.login
        },
        {
          label: "Log in",
          command: this.login
        }
      ]
    }
  }

  hasToBeLandlord(): boolean {
    return this.authService.hasAnyAuthority("ROLE_LANDLORD");
  }

  openNewListing(): void {
    this.ref = this.dialogService.open(PropertiesCreateComponent,
      {
        width: "60%",
        header: "Airbnb your home",
        closable: true,
        focusOnShow: true,
        modal: true,
        showHeader: true
      })
  }

  openNewSearch(): void {
    this.ref = this.dialogService.open(SearchComponent,
      {
        width: "40%",
        header: "Search",
        closable: true,
        focusOnShow: true,
        modal: true,
        showHeader: true
      });
  }

  private extractInformationForSearch(): void {
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        if (params["location"]) {
          this.location = params["location"];
          this.guests = params["guests"] + " Guests";
          this.dates = dayjs(params["startDate"]).format("MMM-DD")
            + " to " + dayjs(params["endDate"]).format("MMM-DD");
        } else if (this.location !== "Anywhere") {
          this.location = "Anywhere";
          this.guests = "Add guests";
          this.dates = "Any week";
        }
      }
    })
  }

  // New city slider properties
  cities: City[] = [
    {
      name: 'Marrakech',
      image: 'assets/images/marrakech.jpg',
      description: 'Red City'
    },
    {
      name: 'Paris',
      image: 'assets/images/paris.jpg',
      description: 'City of Love and Lights'
    },
    {
      name: 'New York',
      image: 'assets/images/newyork.jpg',
      description: 'The City That Never Sleeps'
    },
    {
      name: 'Tokyo',
      image: 'assets/images/tokyo.jpg',
      description: 'Modern Metropolis'
    },
    {
      name: 'Barcelona',
      image: 'assets/images/barcelona.jpg',
      description: 'Architectural Wonder'
    },
    {
      name: 'Istanbul',
      image: 'assets/images/istanbul.jpg',
      description: 'City on Two Continents'
    },
    {
      name: 'Singapore',
      image: 'assets/images/singapore.jpg',
      description: 'Garden City'
    },
    {
      name: 'Cape Town',
      image: 'assets/images/capetown.jpg',
      description: 'The Mother City'
    },
    {
      name: 'Sydney',
      image: 'assets/images/sydney.jpg',
      description: 'Harbour City'
    },
    {
      name: 'Rio de Janeiro',
      image: 'assets/images/riodejaneiro.jpg',
      description: 'The Marvellous City'
    },
    {
      name: 'Dubai',
      image: 'assets/images/dubai.jpg',
      description: 'City of Gold'
    }
  ];
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  // Method to handle city selection
  selectCity(city: City) {
    this.location = city.name;
    this.openNewSearch();
  }
}
