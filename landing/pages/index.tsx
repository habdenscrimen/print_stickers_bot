import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useState, useLayoutEffect } from "react";
import Slider from "@madzadev/image-slider";
import { Turn as Hamburger } from "hamburger-react";
import { Animated } from "react-animated-css";
import "@madzadev/image-slider/dist/index.css";
import styles from "../styles/Home.module.css";

const links = {
  bot: `https://t.me/stickasybot`,
  support: `https://t.me/stickasy_support`,
  instagram: `https://www.instagram.com/stickasy_ua/`,
  twitter: `https://twitter.com/stickasy`,
  tiktok: `https:/www.tiktok.com/@stickasy`,
};

const howToUseImages = [
  { url: "/how-it-works/how-it-works-1.webp" },
  { url: "/how-it-works/how-it-works-2.webp" },
  { url: "/how-it-works/how-it-works-3.webp" },
];

const reviewsImages = [
  { url: "/reviews/reviews-carousel-1.svg" },
  { url: "/reviews/reviews-carousel-2.svg" },
  { url: "/reviews/reviews-carousel-3.svg" },
];

const Home: NextPage = () => {
  const [mobile, setMobile] = useState(false);

  const [howItWorksActiveSlide, setHowItWorksActiveSlide] = useState(0);

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>();

  useEffect(() => {
    function updateSize() {
      setMobile(window.outerWidth <= 600);
    }

    window.addEventListener("resize", updateSize);
    window.addEventListener("focus", updateSize);

    updateSize();

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("focus", updateSize);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Стікаси</title>
        <meta name="description" content="Друк Телеграм стікерів" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
      </Head>

      <header className={styles.header} style={showMobileMenu ? {} : {}}>
        <Image
          src="/icons/logo.svg"
          alt="Стікаси"
          width={119.45}
          height={36}
          className={styles.logo}
        />

        <nav className={styles.nav}>
          <a href={links.support} className={styles.navLink}>
            Підтримка
          </a>
          <div className={styles.divider} />
          <a href={links.bot} className={styles.button}>
            Відкрити бота
          </a>
        </nav>

        {mobile ? (
          <Fragment>
            <Hamburger toggled={showMobileMenu} onToggle={setShowMobileMenu} />

            {/* @ts-expect-error */}
            <Animated
              animationIn="fadeInDown"
              animationOut="fadeOutUp"
              isVisible={Boolean(showMobileMenu)}
              className={styles.mobileMenu}
              animationInDuration={500}
              animationOutDuration={500}
              animateOnMount={false}
            >
              <div className={styles.logoHider}></div>
              <div className={styles.container}>
                <div className={styles.socials}>
                  <a href={links.instagram} className={styles.logo}>
                    <Image
                      src="/icons/instagram-logo.svg"
                      alt="Стікаси"
                      width={24}
                      height={24}
                      className={styles.logo}
                    />
                  </a>
                  <a href={links.twitter} className={styles.logo}>
                    <Image
                      src="/icons/twitter-logo.svg"
                      alt="Стікаси"
                      width={24}
                      height={24}
                      className={styles.logo}
                    />
                  </a>
                  <a href={links.tiktok} className={styles.logo}>
                    <Image
                      src="/icons/tiktok-logo.svg"
                      alt="Стікаси"
                      width={24}
                      height={24}
                      className={styles.logo}
                    />
                  </a>
                </div>

                <div className={styles.divider}></div>

                <a className={styles.support} href={links.support}>
                  Написати у підтримку
                </a>
              </div>
            </Animated>
          </Fragment>
        ) : null}
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>
              Простий друк
              <br />
              Телеграм стікерів
            </h1>
            <p className={styles.subtitle}>
              Надішли боту стікери і за тиждень отримай надруковані на Новій
              Пошті.
            </p>
            <div className={styles.openBotButtonContainer}>
              <a className={styles.openBotButton} href={links.bot}>
                Відкрити бота
              </a>
            </div>
            <p className={styles.conditions}>ℹ️ Відправляємо без передоплати</p>
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={
                mobile
                  ? "/hero/hero-stickers-mobile.webp"
                  : "/hero/hero-stickers.webp"
              }
              alt="Стікери"
              className={styles.image}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.carousel}>
            <Slider
              imageList={howToUseImages}
              bgColor="#FFFEFC"
              showDotControls={false}
              height={mobile ? 394 : 570}
              width="auto"
              autoPlay={true}
              onActiveChange={setHowItWorksActiveSlide}
            />
          </div>
          <div className={styles.textContainer}>
            <h2 className={styles.title}>Як це працює</h2>
            <p
              className={
                howItWorksActiveSlide === 0 ? styles.textActive : styles.text
              }
            >
              1. Надсилаєш боту стікери.
            </p>
            <p
              className={
                howItWorksActiveSlide === 1 ? styles.textActive : styles.text
              }
            >
              2. Вводиш адресу доставки.
            </p>
            <p
              className={
                howItWorksActiveSlide === 2 ? styles.textActive : styles.text
              }
            >
              3. Забираєш стікери на Новій Пошті.
            </p>
          </div>
        </section>

        <section className={styles.characteristics}>
          <div className={styles.textContainer}>
            <h2 className={styles.title}>Характеристики</h2>
            <ul className={styles.list}>
              <li>Стікери глянцеві, ламіновані.</li>
              <li>Води не бояться.</li>
              <li>Розмір стікера — 4х4 см.</li>
            </ul>
          </div>
          <div className={styles.imageContainer}>
            <Image
              src="/characteristics.svg"
              alt="Характеристики"
              className={styles.image}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </section>

        <section className={styles.reviews}>
          <div className={styles.carousel}>
            <Slider
              imageList={reviewsImages}
              bgColor="#FFFEFC"
              showDotControls={false}
              height={mobile ? 150 : 212}
              width="auto"
              autoPlay={false}
            />
          </div>
          <div className={styles.textContainer}>
            <h2 className={styles.title}>Відгуки про нас</h2>
            <p className={styles.subtitle}>
              Якісний сервіс для нас на першому місці. Кожен стікер робимо як
              для себе :)
            </p>
          </div>
        </section>

        <section className={styles.price}>
          <div className={styles.textContainer}>
            <h2 className={styles.title}>Ціни</h2>
            <p className={styles.subtitle}>
              Чим більше стікерів Ви замовите, тим меншою буде ціна за один
              стікер.
            </p>
            <p className={styles.conditions}>ℹ️ Відправляємо без передоплати</p>
          </div>

          <div className={styles.priceContainer}>
            <p className={styles.priceList}>
              👉 1-5 шт — 18 грн/шт
              <br />
              👉 6-10 шт — 16 грн/шт
              <br />
              👉 від 11 шт — 14 грн/шт
              <br />
              🚚 від 25 шт — безкоштовна доставка
            </p>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.openBotButtonContainer}>
            <a className={styles.openBotButton} href={links.bot}>
              Відкрити бота
            </a>
          </div>
        </section>

        <section className={styles.gallery}>
          <div className={styles.imagesContainer}>
            <div className={styles.imageContainer}>
              <Image
                src="/gallery/1.webp"
                alt="Photo-1"
                className={styles.image}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className={styles.imageContainer}>
              <Image
                src="/gallery/2.webp"
                alt="Photo-2"
                className={styles.image}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className={styles.imageContainer}>
              <Image
                src="/gallery/3.webp"
                alt="Photo-3"
                className={styles.image}
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>

          <a href={links.instagram} className={styles.link}>
            Ще фото
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.divider} />

        {!mobile ? (
          <div className={styles.container}>
            <div className={styles.left}>
              <Image
                src="/icons/logo.svg"
                alt="Стікаси"
                width={119.45}
                height={36}
                className={styles.logo}
              />
              <div className={styles.textContainer}>
                <span className={styles.text}>Маєте питання?</span>
                <a href={links.support} className={styles.link}>
                  Написати у підтримку
                </a>
              </div>
            </div>
            <div className={styles.right}>
              <a href={links.instagram} className={styles.logo}>
                <Image
                  src="/icons/instagram-logo.svg"
                  alt="Стікаси"
                  width={24}
                  height={24}
                  className={styles.logo}
                />
              </a>
              <a href={links.twitter} className={styles.logo}>
                <Image
                  src="/icons/twitter-logo.svg"
                  alt="Стікаси"
                  width={24}
                  height={24}
                  className={styles.logo}
                />
              </a>
              <a href={links.tiktok} className={styles.logo}>
                <Image
                  src="/icons/tiktok-logo.svg"
                  alt="Стікаси"
                  width={24}
                  height={24}
                  className={styles.logo}
                />
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.container}>
            <div className={styles.top}>
              <Image
                src="/icons/logo.svg"
                alt="Стікаси"
                width={119.45}
                height={36}
                className={styles.logo}
              />

              <div>
                <a href={links.instagram} className={styles.logo}>
                  <Image
                    src="/icons/instagram-logo.svg"
                    alt="Стікаси"
                    width={24}
                    height={24}
                    className={styles.logo}
                  />
                </a>
                <a href={links.twitter} className={styles.logo}>
                  <Image
                    src="/icons/twitter-logo.svg"
                    alt="Стікаси"
                    width={24}
                    height={24}
                    className={styles.logo}
                  />
                </a>
                <a href={links.tiktok} className={styles.logo}>
                  <Image
                    src="/icons/tiktok-logo.svg"
                    alt="Стікаси"
                    width={24}
                    height={24}
                    className={styles.logo}
                  />
                </a>
              </div>
            </div>

            <div className={styles.bottom}>
              <span className={styles.text}>Маєте питання?</span>
              <a href={links.support} className={styles.link}>
                Написати у підтримку
              </a>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Home;
