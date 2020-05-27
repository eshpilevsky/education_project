import { Component, OnInit } from '@angular/core';
import { kgV } from '../../../_helpers'

interface PartnerLogo {
  href: string,
  src: string,
  alt: string
}


const partnerLogos: PartnerLogo[] = [
  {
    href: 'https://',
    src: 'assets/img/partners/devby.png',
    alt: 'devby'
  },
  {
    href: 'https://',
    src: 'assets/img/partners/tutby.png',
    alt: 'tutby'
  },
]

@Component({
  selector: 'home-more-information-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {
  partnerGroupsMobile: PartnerLogo[][] = []
  partnerGroupsDesktop: PartnerLogo[][] = []
  mobilePageSize = 2
  desktopPageSize = 4

  carouselChangeInterval = 4000

  constructor() { }

  ngOnInit(): void {
    this.partnerGroupsDesktop = this.calculateItems(partnerLogos, this.desktopPageSize)
    this.partnerGroupsMobile = this.calculateItems(partnerLogos, this.mobilePageSize)
  }

  calculateItems<T>(array: T[], pageSize): T[][] {
    const mustItemCount = kgV(array.length, pageSize)
    // console.log(mustItemCount)
    const pagesCount = mustItemCount / pageSize
    // console.log(pagesCount)

    const returnArray: T[][] = []

    for (let page = 0; page < pagesCount; page++) {
      const itemId = page * pageSize
      const startIndex = itemId % array.length
      const pageArray: T[] = []

      for (let i = 0; i < pageSize; i++) {
        const index = (startIndex + i) % array.length
        pageArray.push(array[index])
      }
      returnArray.push(pageArray)
    }

    return returnArray
  }

}
