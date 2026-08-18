import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La puerta del portal era /login y pasó a ser la raíz. El redirect existe
  // para que los links viejos que andan por correo no mueran en un 404.
  async redirects() {
    return [{ source: "/login", destination: "/", permanent: true }];
  },
};

export default nextConfig;
