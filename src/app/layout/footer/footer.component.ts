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
    { icon: ['fab', 'facebook'], link: 'https://facebook.com/Riadi ' },
    { icon: ['fab', 'twitter'], link: 'https://twitter.com/Riadi ' },
    { icon: ['fab', 'instagram'], link: 'https://instagram.com/Riadi ' },
    { icon: ['fab', 'linkedin'], link: 'https://linkedin.com/company/Riadi ' },
    { icon: ['fab', 'tiktok'], link: 'https://tiktok.com/@Riadi ' }
  ];

  quickLinks = [
    { label: 'About Us', link: '/about' },
    { label: 'Contact', link: '/contact' },
    { label: 'FAQ', link: '/faq' },
    { label: 'Careers', link: '/careers' }
  ];
}
