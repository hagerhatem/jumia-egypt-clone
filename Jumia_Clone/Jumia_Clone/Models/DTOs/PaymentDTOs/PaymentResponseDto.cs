﻿namespace Jumia_Clone.Models.DTOs.PaymentDTOs
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string PaymentUrl { get; set; }
        public string TransactionId { get; set; }
        public string Message { get; set; }
    }
}
