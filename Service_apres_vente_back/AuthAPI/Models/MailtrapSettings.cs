namespace AuthAPI.Models
{
   

    public class MailtrapSettings
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Host { get; set; } = "smtp.mailtrap.io";
        public int Port { get; set; } = 2525;
        public bool UseSsl { get; set; } = false;
    }
}