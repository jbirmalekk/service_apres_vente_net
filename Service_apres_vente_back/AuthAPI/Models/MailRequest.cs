// Dans le dossier Models d'AuthAPI, ajoutez MailRequest.cs
namespace AuthAPI.Models
{
    public class MailRequest
    {
        public string ToEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
    }
}