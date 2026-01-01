// Dans le dossier Models d'AuthAPI, ajoutez ConfirmEmailModel.cs
using System.ComponentModel.DataAnnotations;

namespace AuthAPI.Models
{
    public class ConfirmEmailModel
    {
        [Required(ErrorMessage = "L'email est obligatoire")]
        [EmailAddress(ErrorMessage = "Format d'email invalide")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le token est obligatoire")]
        public string Token { get; set; } = string.Empty;
    }
}