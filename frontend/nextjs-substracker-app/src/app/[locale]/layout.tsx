import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getServerTheme, type Theme } from "@/shared/utils/getServerTheme";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout( { children, params }: Props ) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  //checks if locale is allowed, otherwise 404

  const messages = await getMessages();         //loads translations for current locale
  const theme: Theme = await getServerTheme();  //detects theme before rendering:

  return (
    <html lang={locale} className={theme} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>    {/*NextIntlClientProvider it allows client components to use  const t = useTranslations(); (without it, translation won't work.)*/}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
