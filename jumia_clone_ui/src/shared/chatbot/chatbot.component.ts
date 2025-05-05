import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/Chatbot/chatbot.service';

interface ChatMessage {
  isUser: boolean;
  text: string;
  products?: Array<{
    id: number;
    name: string;
    price: number;
    description: string;
    rating: number;
    stockQuantity: number;
    isAvailable: boolean;
  }>;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private messagesContainer!: ElementRef;
  selectedImage: File | null = null;

  isOpen = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  private shouldScroll = false;

  viewProduct(productId: number) {
    this.router.navigate(['/Products', productId]);
  }
  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch(err) { }
  }


  constructor(
    private chatbotService: ChatbotService,
    private router: Router
  ) {}

  ngOnInit() {
    
    this.messages.push({
      isUser: false,
      text: 'Hello! How can I help you today? Feel free to ask about products or any other questions!'
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    
    this.messages.push({
      isUser: true,
      text: this.currentMessage
    });
    this.shouldScroll = true;

    const question = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    this.chatbotService.AskQuestion(question).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let message: ChatMessage = {
            isUser: false,
            text: response.data.formattedResponse || 'Here\'s what I found:'
          };

          
          if (response.data.rawResults && response.data.rawResults.length > 0) {
            message.products = response.data.rawResults.map((product: {
              PRODUCT_ID: number;
              NAME: string;
              BASE_PRICE: number;
              DESCRIPTION: string;
              STOCK_QUANTITY: number;
              IS_AVAILABLE: boolean;
            }) => ({
              id: product.PRODUCT_ID,
              name: product.NAME,
              price: product.BASE_PRICE,
              description: product.DESCRIPTION,
              stockQuantity: product.STOCK_QUANTITY,
              isAvailable: product.IS_AVAILABLE,
              rating: 0 
            }));
          }

          this.messages.push(message);
        } else {
          
          this.messages.push({
            isUser: false,
            text: 'I couldn\'t find any relevant information.'
          });
        }
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: (error) => {
        this.messages.push({
          isUser: false,
          text: 'Sorry, I encountered an error. Please try again.'
        });
        this.isLoading = false;
        this.shouldScroll = true;
        console.error('Chatbot error:', error);
      },
      complete: () => {
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }


  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.searchWithImage();
      event.target.value = '';
    }
  }

  searchWithImage() {
    if (!this.selectedImage) return;

    this.messages.push({
      isUser: true,
      text: 'Searching with uploaded image...'
    });
    this.shouldScroll = true;
    this.isLoading = true;

    this.chatbotService.searchByImage(this.selectedImage).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let message: ChatMessage = {
            isUser: false,
            text: response.data.imageDescription || 'Here are similar products I found:'
          };

          if (response.data.results && response.data.results.length > 0) {
            message.products = response.data.results.map((product: {
              PRODUCT_ID: number;
              NAME: string;
              BASE_PRICE: number;
              DESCRIPTION: string;
              STOCK_QUANTITY: number;
              IS_AVAILABLE: boolean;
            }) => ({
              id: product.PRODUCT_ID,
              name: product.NAME,
              price: product.BASE_PRICE,
              description: product.DESCRIPTION,
              stockQuantity: product.STOCK_QUANTITY,
              isAvailable: product.IS_AVAILABLE,
              rating: 0
            }));
          }

          this.messages.push(message);
        } else {
          this.messages.push({
            isUser: false,
            text: 'I couldn\'t find any similar products.'
          });
        }
        this.isLoading = false;
        this.shouldScroll = true;
        this.selectedImage = null;
      },
      error: (error) => {
        this.messages.push({
          isUser: false,
          text: 'Sorry, I encountered an error processing the image. Please try again.'
        });
        this.isLoading = false;
        this.shouldScroll = true;
        this.selectedImage = null;
        console.error('Image search error:', error);
      }
    });
  }

}