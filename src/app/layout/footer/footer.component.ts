// footer.component.ts
import { Component } from '@angular/core';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { RouterModule } from '@angular/router';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    FontAwesomeModule,
    RouterModule,
    NgForOf
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  socialMediaLinks = [
    { icon: ['fab', 'facebook'], link: 'https://facebook.com/blablahouse' },
    { icon: ['fab', 'twitter'], link: 'https://twitter.com/blablahouse' },
    { icon: ['fab', 'instagram'], link: 'https://instagram.com/blablahouse' },
    { icon: ['fab', 'linkedin'], link: 'https://linkedin.com/company/blablahouse' },
    { icon: ['fab', 'tiktok'], link: 'https://tiktok.com/@blablahouse' }
  ];

  quickLinks = [
    { label: 'About Us', link: '/about' },
    { label: 'Contact', link: '/contact' },
    { label: 'FAQ', link: '/faq' },
    { label: 'Careers', link: '/careers' }
  ];
}
