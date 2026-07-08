/**
 * Production environment configuration.
 *
 * Replace apiUrl with the deployed Safqa API origin before shipping
 * (e.g. https://api.safqa.com/api, or http://safka.runasp.net/api if
 * deploying to the same free hosting as the backend). Keeping the
 * '/api' suffix matches the [Route("api/[controller]")] convention used
 * by every controller in the backend.
 */
export const environment = {
  production: true,
  apiUrl: 'https://safka.runasp.net/api',
};
