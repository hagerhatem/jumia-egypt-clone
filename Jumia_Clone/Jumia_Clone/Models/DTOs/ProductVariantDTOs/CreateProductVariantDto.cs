using System.ComponentModel.DataAnnotations;

namespace Jumia_Clone.Models.DTOs.ProductVariantDTOs
{
    public class CreateProductVariantDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string VariantName { get; set; }

        [Required]
        [Range(0.01, 99999999.99)]
        public decimal Price { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [StringLength(50)]
        public string Sku { get; set; }

        public IFormFile VariantImageFile { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsAvailable { get; set; }
        // Add this field to hold the JSON string
        public string VariantAttributesJson { get; set; }

        // Keep the original property but don't expect it to be bound from the form
        [System.Text.Json.Serialization.JsonIgnore]
        public List<VariantAttributeInputDto> VariantAttributes { get; set; } = new List<VariantAttributeInputDto>();
    }
}
