using System.ComponentModel.DataAnnotations;

namespace Jumia_Clone.Models.DTOs.AuthenticationDTOs
{
    public class AuthChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}
