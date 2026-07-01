import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private ordersService: OrdersService) {}

  async initiatePayment(orderId: string, method: string) {
    // In production, integrate with real payment providers
    // MTN MoMo, Orange Money, Wave, etc.
    const simulatedRef = `SIM-${uuidv4().split('-')[0].toUpperCase()}`;
    return {
      orderId,
      paymentRef: simulatedRef,
      method,
      status: 'PENDING',
      message: `Paiement initié via ${method}. Référence: ${simulatedRef}`,
      instructions: this.getPaymentInstructions(method, simulatedRef),
    };
  }

  async confirmPayment(orderId: string, paymentRef: string) {
    // Simulate payment confirmation
    const order = await this.ordersService.complete(orderId, paymentRef);
    return { success: true, order, message: 'Paiement confirmé avec succès !' };
  }

  async simulateWebhook(orderId: string) {
    // Simulate instant payment for demo
    const ref = `DEMO-${Date.now()}`;
    return this.confirmPayment(orderId, ref);
  }

  private getPaymentInstructions(method: string, ref: string): string {
    const instructions: Record<string, string> = {
      mtn_momo: `Composez *880# sur votre téléphone MTN et entrez le code: ${ref}`,
      orange_money: `Composez #144# sur votre téléphone Orange et entrez le code: ${ref}`,
      wave: `Ouvrez l'application Wave et scannez le QR code. Référence: ${ref}`,
      airtel_money: `Composez *500# sur votre téléphone Airtel et entrez le code: ${ref}`,
      moov: `Composez *155# sur votre téléphone Moov et entrez le code: ${ref}`,
      card: `Vous allez être redirigé vers la page de paiement sécurisé.`,
    };
    return instructions[method] || `Référence de paiement: ${ref}`;
  }
}
