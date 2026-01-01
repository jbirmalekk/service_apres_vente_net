using Microsoft.AspNetCore.Mvc;
using Stripe;
using InterventionAPI.Models.Repositories;
using InterventionAPI.Models;

namespace InterventionAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StripeController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IInterventionRepository _repository;
        private readonly ILogger<StripeController> _logger;

        public StripeController(
            IConfiguration configuration,
            IInterventionRepository repository,
            ILogger<StripeController> logger)
        {
            _configuration = configuration;
            _repository = repository;
            _logger = logger;
            
            // Configure Stripe with secret key
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            try
            {
                // Validate facture exists
                var facture = await _repository.GetFactureByIdAsync(request.FactureId);
                if (facture == null)
                {
                    return NotFound(new { error = "Facture non trouvée" });
                }

                // Create PaymentIntent
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(facture.MontantTTC * 100), // Stripe uses cents
                    Currency = "eur",
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                    },
                    Metadata = new Dictionary<string, string>
                    {
                        { "factureId", request.FactureId.ToString() },
                        { "factureNumero", facture.NumeroFacture ?? "" },
                        { "clientNom", facture.ClientNom ?? "" },
                        { "clientEmail", facture.ClientEmail ?? "" }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                return Ok(new
                {
                    clientSecret = paymentIntent.ClientSecret,
                    publishableKey = _configuration["Stripe:PublishableKey"]
                });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Erreur Stripe lors de la création du PaymentIntent");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du PaymentIntent");
                return StatusCode(500, new { error = "Erreur interne du serveur" });
            }
        }

        [HttpPost("confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            try
            {
                // Retrieve PaymentIntent to verify
                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(request.PaymentIntentId);

                if (paymentIntent == null)
                {
                    return NotFound(new { error = "PaymentIntent non trouvé" });
                }

                // Check if payment succeeded
                if (paymentIntent.Status != "succeeded")
                {
                    return BadRequest(new { error = "Le paiement n'a pas réussi", status = paymentIntent.Status });
                }

                // Get facture ID from metadata
                if (!paymentIntent.Metadata.TryGetValue("factureId", out var factureIdStr) ||
                    !int.TryParse(factureIdStr, out var factureId))
                {
                    return BadRequest(new { error = "ID de facture invalide" });
                }

                // Update facture status
                var facture = await _repository.GetFactureByIdAsync(factureId);
                if (facture == null)
                {
                    return NotFound(new { error = "Facture non trouvée" });
                }

                facture.Statut = "payée";
                facture.DatePaiement = DateTime.Now;
                await _repository.UpdateFactureAsync(facture);

                _logger.LogInformation($"Paiement Stripe confirmé pour la facture {facture.NumeroFacture} (PaymentIntent: {paymentIntent.Id})");

                return Ok(new
                {
                    success = true,
                    factureId = facture.Id,
                    numeroFacture = facture.NumeroFacture,
                    paymentIntentId = paymentIntent.Id,
                    amount = paymentIntent.Amount / 100.0
                });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Erreur Stripe lors de la confirmation du paiement");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la confirmation du paiement");
                return StatusCode(500, new { error = "Erreur interne du serveur" });
            }
        }
    }

    public class CreatePaymentIntentRequest
    {
        public int FactureId { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string PaymentIntentId { get; set; } = string.Empty;
    }
}
