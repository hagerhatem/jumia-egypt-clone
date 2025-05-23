﻿// <auto-generated> This file has been auto generated by EF Core Power Tools. </auto-generated>
#nullable disable


namespace Jumia_Clone.Models.Entities;

public class ProductRecommendation
{
    public int RecommendationId { get; set; }

    public int SourceProductId { get; set; }

    public int RecommendedProductId { get; set; }

    public string RecommendationType { get; set; }

    public decimal Score { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual Product RecommendedProduct { get; set; }

    public virtual Product SourceProduct { get; set; }
}