/**
 * Development environment configuration.
 *
 * apiUrl points at the ASP.NET Core backend's HTTPS profile as defined in
 * Safqa/Properties/launchSettings.json ("https" profile -> https://localhost:7062).
 * Switch to 'http://localhost:5287/api' if you run the backend with
 * `dotnet run --launch-profile http` instead.
 */
export const environment = {
  production: false,
 apiUrl: 'https://safka.runasp.net/api'
};
