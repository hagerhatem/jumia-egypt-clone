import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UpArrowComponent } from "../../../public/home-page/homeComponents/upArrow/up-arrow/up-arrow.component";

@Component({
  selector: 'app-warranty',
  imports: [CommonModule, RouterModule, UpArrowComponent],
  templateUrl: './warranty.component.html',
  styleUrl: './warranty.component.css',
  standalone: true,
})
export class WarrantyComponent {
  sections = [
    {
      id: 1,
      title: 'How to know if my product is under warranty?',
      isExpanded: true,
      content: [
        'Jumia works with the best suppliers and vendors to provide the best and affordable products to its customers.',
        'Sometimes, things may go wrong with these products. Luckily, be sure that our brands are committed to our customers, so much so we are. They show that commitment through warranties.',
        'The warranty ensures that if anything goes wrong, that is not the customer\'s fault, your product may be repaired or may be replaced.',
        'Warranty is available on selected brands and products.'
      ]
    },
    {
      id: 2,
      title: 'How do I know if my product has a warranty?',
      isExpanded: true,
      content: [
        'On the product page, on the right of the product, there is a field for warranty.',
        'If the product has a warranty, this field will be filled with the duration as shown below.'
      ],
      policyInfo: [
        {
          title: 'Return Policy',
          duration: '14 days free return (except for underwear and personal items) up to 30 days for defective products. Eligibility for requesting a refund within 24 hours from the delivery date.',
          icon: 'return',
          link: 'See more'
        },
        {
          title: 'Warranty',
          duration: '2 Years',
          icon: 'warranty'
        }
      ]
    },
    {
      id: 3,
      title: 'How can I activate my warranty?',
      isExpanded: true,
      content: [
        'If you call Jumia within 30 days after delivery:',
        'Your product may still be returnable without using the warranty. Check our Return Policy for detailed information.',
        'Over 30 days since delivery and the product has a warranty:',
        'Contact the service center listed on our warranty page or call Jumia and we will provide the contact for you.',
        'If it\'s over 30 days since delivery and the product has no warranty:',
        'Unfortunately, you are responsible for the repair costs.',
        'You can request a tax invoice by filling out the following form here. The electronic invoice will be sent to you via email within 3 business days.',
        'For any further inquiries about warranty, please reach out to us here.'
      ]
    },
    {
      id: 4,
      title: 'How do I go about servicing my product?',
      isExpanded: true,
      content: [
        'Please send the product(s) directly to the respective service center stated on the warranty card (if you have one) or given to you by our customer service team. For a prompt warranty claim kindly include all the accessories, information included in the packaging, and proof of purchase of an item from Jumia (invoice).'
      ]
    },
    {
       id: 5,
      title: 'Where are the service centers?',
      isExpanded: true,
      content: [
        'Please refer to the manufacturer (or service center) details on the warranty card included with your product. If there is no warranty card, please check the user manual or product packaging for more details.'
      ],
      collapsible: {
        title: 'You can also refer to our warranty directory below',
        isExpanded: false,
        serviceCentersTable: {
          headers: ['Brand', 'Category', 'Service Center', 'Phone Number'],
          rows: [
            { brand: 'HOHO', category: 'Appliances', serviceCenter: 'HOHO', phoneNumber: '01110096555' },
            { brand: 'EGA', category: 'Appliances', serviceCenter: 'EGA', phoneNumber: '201221850670' },
            { brand: 'Tornado', category: 'Appliances', serviceCenter: 'El-Araby Group', phoneNumber: '19319' },
            { brand: 'Tornado', category: 'Appliances', serviceCenter: 'El-Araby Group', phoneNumber: '19319' },
            { brand: 'Jac', category: 'Appliances', serviceCenter: 'El-tersasa Group', phoneNumber: '19332' },
            { brand: 'Braun', category: 'Beauty & perfumes', serviceCenter: 'Mido', phoneNumber: '16016' },
            { brand: 'Toshiba', category: 'Computing', serviceCenter: 'ECB Distribution', phoneNumber: '201066870632' },
            { brand: 'Toshiba', category: 'Computing', serviceCenter: 'ECB Distribution', phoneNumber: '201066870632' },
            { brand: 'Sandisk', category: 'Computing', serviceCenter: 'ECB Distribution', phoneNumber: '201066870632' },
            { brand: 'Xiaomi', category: 'Phones', serviceCenter: 'Xiaomi Service Center', phoneNumber: '19954' },
            { brand: 'Samsung', category: 'Phones', serviceCenter: 'SRV cairo service center', phoneNumber: '19759' },
            { brand: 'Tecno', category: 'Phones', serviceCenter: 'Call care / Tecno Service Center', phoneNumber: '19538' },
            { brand: 'Infinix', category: 'Phones', serviceCenter: 'Carlcare', phoneNumber: '19538' },
            { brand: 'Samsung', category: 'TVs, Audio and Video', serviceCenter: 'Samsung Egypt', phoneNumber: '16580' },
            { brand: 'Jac', category: 'TVs, Audio and Video', serviceCenter: 'El Tersasa group', phoneNumber: '19332' },
            { brand: 'Canon', category: 'Laptops, hard drive and printers', serviceCenter: 'Silicon21', phoneNumber: '02 24060011' },
            { brand: 'Tank', category: 'Home & living', serviceCenter: 'Mido', phoneNumber: '16016' },
            { brand: 'Samsung', category: 'Home & living', serviceCenter: 'Samsung', phoneNumber: '16580' },
            { brand: 'Toshiba', category: 'Home & living', serviceCenter: 'Alnahar', phoneNumber: '19319' },
            { brand: 'Sharp', category: 'Home & living', serviceCenter: 'Alnahar', phoneNumber: '19319' },
            { brand: 'Tornado', category: 'Home & living', serviceCenter: 'Alnahar', phoneNumber: '19319' },
            { brand: 'Fresh', category: 'Home & living', serviceCenter: 'Fresh', phoneNumber: '19090' },
            { brand: 'Zanussi', category: 'Home & living', serviceCenter: 'Zanussi', phoneNumber: '19990' },
            { brand: 'Kiriazi', category: 'Home & living', serviceCenter: 'Solito', phoneNumber: '19091' },
            { brand: 'whitepoint', category: 'Home & living', serviceCenter: 'Elabd', phoneNumber: '19595' },
            { brand: 'Ideal', category: 'Home & living', serviceCenter: 'Tiba', phoneNumber: '19312' },
            { brand: 'Infinix', category: 'Mobiles', serviceCenter: 'Carlcare', phoneNumber: '19538' },
            { brand: 'Oppo', category: 'Mobiles', serviceCenter: 'Carlcare', phoneNumber: '19538' },
            { brand: 'Itel', category: 'Mobiles', serviceCenter: 'Carlcare', phoneNumber: '19538' },
            { brand: 'Realme', category: 'Mobiles', serviceCenter: 'Carlcare', phoneNumber: '19538' },
            { brand: 'Huawei', category: 'Phones', serviceCenter: 'Raya', phoneNumber: '19900' },
            { brand: 'Nokia', category: 'Phones', serviceCenter: 'Raya', phoneNumber: '19900' },
            { brand: 'Lenovo', category: 'Phones', serviceCenter: 'Raya', phoneNumber: '19900' }
          ]
        }
      },
      additionalInfo: [
        'In case you still cannot find your service Center, feel free to reach out to us on our hotline number 19586 and we\'ll be more than happy to assist you.'
      ]
    },
    {
      id: 6,
      title: 'If my product is within warranty duration, do I need to pay for repairs?',
      isExpanded: true,
      content: [
        'If your product is within warranty duration and is damaged by mechanical or electrical systems, you don\'t have to worry about the repairing cost. You will be covered.'
      ]
    },
    {
      id: 7,
      title: 'If my product is out of warranty duration, do I need to pay for repairs?',
      isExpanded: true,
      content: [
        'If your product is out of warranty duration, you will be responsible for the repair cost. We suggest that you repair the product at a service center authorized by the manufacturer for better quality services.'
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleSection(section: any): void {
    section.isExpanded = !section.isExpanded;
  }

  toggleCollapsible(collapsible: any): void {
    collapsible.isExpanded = !collapsible.isExpanded;
  }
}


