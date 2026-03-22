import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import AuthBootstrap from "@/components/shared/AuthBootstrap";
import ReduxProvider from "@/redux/provider";

export const metadata = {
  title: "Summarist",
  description: "Summarist audiobook platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthBootstrap />
          <AppShell>{children}</AppShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
