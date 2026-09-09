import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'mpa-routing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, search] = (req.url || '').split('?');
          const query = search ? '?' + search : '';
          
          if (pathname === '/alpa' || pathname === '/alpa.html') {
            req.url = '/alpa/' + query;
          } else if (pathname === '/lp2' || pathname === '/lp2.html') {
            req.url = '/lp2/' + query;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lp2: resolve(__dirname, 'lp2/index.html'),
        alpa: resolve(__dirname, 'alpa/index.html')
      }
    }
  }
});

