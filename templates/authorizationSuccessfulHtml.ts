import { html } from 'hono/html';

export const authorizationSuccessfulHtml = html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Authorization Successful</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body class="bg-[#f0f0f0] flex min-h-screen items-center justify-center">
      <div
        class="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
      >
        <div class="p-6">
          <h1 class="mb-2 text-center text-2xl font-bold text-[#1E1E1E]">
            Authorization Successful
          </h1>
          <p class="text-center text-gray-600">
            You have been successfully authorized. You can now close this window
            and return to Figma.
          </p>
        </div>
        <div class="bg-gray-50 p-4">
          <button
            onclick="closeWindow();"
            class="w-full bg-[#000] hover:bg-[#000] text-white font-bold py-2 px-4 rounded"
          >
            Close Window
          </button>
        </div>
      </div>
      <script>
        function closeWindow() {
          window.close();
        }
      </script>
    </body>
  </html>
`;
