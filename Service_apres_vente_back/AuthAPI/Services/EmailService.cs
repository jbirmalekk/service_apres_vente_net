using AuthAPI.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Microsoft.Extensions.Logging;

namespace AuthAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(MailRequest mailRequest);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken);
        Task SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink);
        Task SendWelcomeEmailAsync(string toEmail, string userName);
    }

    public class EmailService : IEmailService
    {
        private readonly MailtrapSettings _mailtrapSettings;
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(
            IOptions<MailtrapSettings> mailtrapSettings,
            ILogger<EmailService> logger,
            IConfiguration configuration)
        {
            _mailtrapSettings = mailtrapSettings.Value;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendEmailAsync(MailRequest mailRequest)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("Service SAV", "noreply@sav-entreprise.com"));
                email.To.Add(MailboxAddress.Parse(mailRequest.ToEmail));
                email.Subject = mailRequest.Subject;

                var builder = new BodyBuilder();
                if (mailRequest.IsHtml)
                {
                    builder.HtmlBody = mailRequest.Body;
                }
                else
                {
                    builder.TextBody = mailRequest.Body;
                }

                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                
                await smtp.ConnectAsync(
                    _mailtrapSettings.Host,
                    _mailtrapSettings.Port,
                    _mailtrapSettings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

                await smtp.AuthenticateAsync(_mailtrapSettings.Username, _mailtrapSettings.Password);
                
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation($"Email envoyé avec succès à {mailRequest.ToEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi de l'email");
                throw;
            }
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
        {
            try
            {
                var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
                var resetPath = _configuration["Frontend:ResetPasswordPath"] ?? "/reset-password";
                
                var resetLink = $"{frontendUrl}{resetPath}?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(toEmail)}";
                
                var mailRequest = new MailRequest
                {
                    ToEmail = toEmail,
                    Subject = "🔑 Réinitialisation de votre mot de passe - Service SAV",
                    Body = BuildPasswordResetEmailTemplate(userName, resetLink),
                    IsHtml = true
                };

                await SendEmailAsync(mailRequest);
                
                _logger.LogInformation($"Email de réinitialisation envoyé à {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'envoi de l'email de réinitialisation à {toEmail}");
                throw;
            }
        }

        public async Task SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink)
        {
            try
            {
                var mailRequest = new MailRequest
                {
                    ToEmail = toEmail,
                    Subject = "✅ Confirmation de votre email - Service SAV",
                    Body = BuildConfirmationEmailTemplate(userName, confirmationLink),
                    IsHtml = true
                };

                await SendEmailAsync(mailRequest);
                
                _logger.LogInformation($"Email de confirmation envoyé à {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'envoi de l'email de confirmation à {toEmail}");
                throw;
            }
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            try
            {
                var mailRequest = new MailRequest
                {
                    ToEmail = toEmail,
                    Subject = "👋 Bienvenue sur le Service SAV !",
                    Body = BuildWelcomeEmailTemplate(userName),
                    IsHtml = true
                };

                await SendEmailAsync(mailRequest);
                
                _logger.LogInformation($"Email de bienvenue envoyé à {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'envoi de l'email de bienvenue à {toEmail}");
                throw;
            }
        }

        private string BuildPasswordResetEmailTemplate(string userName, string resetLink)
        {
            return $@"
                <!DOCTYPE html>
                <html lang='fr'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Réinitialisation de mot de passe</title>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                        }}
                        .content {{
                            padding: 40px;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 14px 28px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: bold;
                            margin: 20px 0;
                            transition: transform 0.3s ease;
                        }}
                        .button:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        }}
                        .footer {{
                            margin-top: 40px;
                            padding: 20px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #eee;
                        }}
                        .security-note {{
                            background-color: #fff3cd;
                            border: 1px solid #ffeaa7;
                            border-radius: 5px;
                            padding: 15px;
                            margin: 20px 0;
                        }}
                        .token-info {{
                            background-color: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: 5px;
                            padding: 15px;
                            margin: 20px 0;
                            word-break: break-all;
                            font-family: monospace;
                            font-size: 12px;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🔑 Réinitialisation de mot de passe</h1>
                            <p>Service SAV - Assistance Technique</p>
                        </div>
                        <div class='content'>
                            <h2>Bonjour {userName},</h2>
                            <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Service SAV.</p>
                            
                            <div style='text-align: center;'>
                                <a href='{resetLink}' class='button'>
                                    🔐 Réinitialiser mon mot de passe
                                </a>
                            </div>
                            
                            <p>Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :</p>
                            
                            <div class='token-info'>
                                {resetLink}
                            </div>
                            
                            <div class='security-note'>
                                <strong>⚠️ Important :</strong>
                                <ul>
                                    <li>Ce lien expirera dans 24 heures</li>
                                    <li>Ne partagez jamais ce lien avec qui que ce soit</li>
                                    <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                                </ul>
                            </div>
                            
                            <p>Pour toute assistance, contactez notre équipe support à <a href='mailto:support@sav-entreprise.com'>support@sav-entreprise.com</a></p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Service SAV - Tous droits réservés</p>
                            <p>123 Rue du Commerce, 75000 Paris, France</p>
                            <p>Tél: +33 1 23 45 67 89 | Email: contact@sav-entreprise.com</p>
                            <p><small>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</small></p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string BuildConfirmationEmailTemplate(string userName, string confirmationLink)
        {
            return $@"
                <!DOCTYPE html>
                <html lang='fr'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Confirmation d'email</title>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                        }}
                        .content {{
                            padding: 40px;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 14px 28px;
                            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: bold;
                            margin: 20px 0;
                            transition: transform 0.3s ease;
                        }}
                        .button:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        }}
                        .features {{
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                            gap: 20px;
                            margin: 30px 0;
                        }}
                        .feature {{
                            text-align: center;
                            padding: 15px;
                            background-color: #f9f9f9;
                            border-radius: 8px;
                        }}
                        .feature-icon {{
                            font-size: 24px;
                            margin-bottom: 10px;
                        }}
                        .footer {{
                            margin-top: 40px;
                            padding: 20px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #eee;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✅ Bienvenue sur Service SAV !</h1>
                            <p>Finalisez votre inscription en confirmant votre email</p>
                        </div>
                        <div class='content'>
                            <h2>Bonjour {userName},</h2>
                            <p>Merci de vous être inscrit sur notre plateforme de Service Après-Vente.</p>
                            <p>Pour finaliser votre inscription et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
                            
                            <div style='text-align: center;'>
                                <a href='{confirmationLink}' class='button'>
                                    ✅ Confirmer mon email
                                </a>
                            </div>
                            
                            <div class='features'>
                                <div class='feature'>
                                    <div class='feature-icon'>📋</div>
                                    <h3>Gestion des réclamations</h3>
                                    <p>Suivez vos réclamations en temps réel</p>
                                </div>
                                <div class='feature'>
                                    <div class='feature-icon'>🔧</div>
                                    <h3>Interventions techniques</h3>
                                    <p>Planifiez et suivez les interventions</p>
                                </div>
                                <div class='feature'>
                                    <div class='feature-icon'>📊</div>
                                    <h3>Tableau de bord</h3>
                                    <p>Visualisez l'état de vos articles</p>
                                </div>
                            </div>
                            
                            <p>Une fois votre email confirmé, vous pourrez :</p>
                            <ul>
                                <li>📋 Créer et suivre vos réclamations</li>
                                <li>🔧 Consulter l'état des interventions techniques</li>
                                <li>📊 Accéder à votre historique complet</li>
                                <li>🔔 Recevoir des notifications importantes</li>
                            </ul>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Service SAV - Tous droits réservés</p>
                            <p>Service Après-Vente spécialisé dans les articles sanitaires et chauffage central</p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string BuildWelcomeEmailTemplate(string userName)
        {
            return $@"
                <!DOCTYPE html>
                <html lang='fr'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Bienvenue sur Service SAV</title>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                        }}
                        .content {{
                            padding: 40px;
                        }}
                        .welcome-icon {{
                            font-size: 48px;
                            text-align: center;
                            margin-bottom: 20px;
                        }}
                        .footer {{
                            margin-top: 40px;
                            padding: 20px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #eee;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>👋 Bienvenue sur Service SAV !</h1>
                            <p>Votre partenaire pour un service après-vente de qualité</p>
                        </div>
                        <div class='content'>
                            <div class='welcome-icon'>🎉</div>
                            <h2>Félicitations {userName} !</h2>
                            <p>Votre compte a été activé avec succès sur notre plateforme de Service Après-Vente.</p>
                            
                            <p><strong>Vous pouvez maintenant :</strong></p>
                            <ul>
                                <li>✅ Accéder à votre compte personnel</li>
                                <li>📋 Déclarer une nouvelle réclamation</li>
                                <li>🔧 Suivre l'avancement des interventions</li>
                                <li>💬 Communiquer avec notre équipe technique</li>
                                <li>📊 Consulter l'historique de vos articles</li>
                            </ul>
                            
                            <p><strong>Conseils pour commencer :</strong></p>
                            <ol>
                                <li>Complétez votre profil utilisateur</li>
                                <li>Ajoutez vos articles (sanitaires, chauffage, etc.)</li>
                                <li>Consultez les tutoriels dans la section aide</li>
                                <li>Téléchargez notre application mobile (disponible prochainement)</li>
                            </ol>
                            
                            <p><strong>Besoin d'aide ?</strong></p>
                            <p>Notre équipe support est disponible du lundi au vendredi de 9h à 18h :</p>
                            <p>📧 Email : <a href='mailto:support@sav-entreprise.com'>support@sav-entreprise.com</a></p>
                            <p>📞 Téléphone : +33 1 23 45 67 89</p>
                            
                            <p style='margin-top: 30px; padding: 15px; background-color: #f0f8ff; border-radius: 5px;'>
                                <strong>💡 Astuce :</strong> Gardez vos informations de garantie à jour pour bénéficier d'interventions gratuites !
                            </p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Service SAV - Votre satisfaction est notre priorité</p>
                            <p>Spécialistes en articles sanitaires et systèmes de chauffage</p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
}