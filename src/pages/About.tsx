
import React from 'react';
import { useTranslation } from 'react-i18next';

export const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <section className="@container w-full">
        <div className="flex flex-col-reverse gap-8 py-10 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-6 lg:w-1/2 justify-center">
            <div className="flex flex-col gap-4 text-left rtl:text-right">
              <span className="text-primary font-bold tracking-wider text-sm uppercase">{t('about.hero.label')}</span>
              <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl font-display">
                {t('about.hero.title')} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{t('about.hero.subtitle')}</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed md:text-lg max-w-[500px]">
                {t('about.hero.description')}
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-white text-base font-bold transition-all hover:bg-primary-dark shadow-lg shadow-primary/25">
                {t('about.hero.readStory')}
              </button>
              <button className="flex h-12 items-center justify-center rounded-lg bg-transparent border border-slate-200 dark:border-slate-700 px-6 text-slate-900 dark:text-white text-base font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                {t('about.hero.meetTeam')}
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full transform translate-x-4 translate-y-4 -z-10"></div>
            <div className="w-full aspect-square md:aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl relative overflow-hidden" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDwOMhk2NUHLk5DssxL6K9R2Q-qLewW-L_mlaygrSJmW1adF2N48RfLYmvzDsPPpnWlkWuXsd41sxkyXaf-5qLn82lS3QbD6H1fL2eCy9JHPrfSMUO2hRsSLbedJVBUs3VkXav6GhGx1hPpHxwnMqQbD-jhmQLWRT-sm1-oSH7JsReOzxe1K8Rx0LzGZTGGBV3-SZw_CDUpiJoMBN3pCUmAICr4jzYJt6Yvf_Ds3x1V2ieYmmhBZbpzGsv7NNLFZt_yON7Fz9unT0c")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6 text-white">
                <p className="font-bold text-lg font-display">{t('about.hero.since')}</p>
                <p className="text-sm opacity-80">{t('about.hero.location')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full">
        <div className="bg-primary/5 dark:bg-slate-800/50 border border-primary/10 dark:border-slate-700 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <span className="text-sm font-bold text-primary uppercase tracking-wider">{t('about.mission.label')}</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mb-4 font-display">{t('about.mission.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: '50k+', label: t('about.stats.readers') },
                  { val: '1.2M', label: t('about.stats.words') },
                  { val: '12', label: t('about.stats.members') },
                  { val: '4.9', label: t('about.stats.rating') }
                ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-3xl font-black text-primary font-display">{item.val}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story & Milestones */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div>
            <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-6 font-display">{t('about.origin.title')}</h2>
            <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-400">
              <p className="mb-4">
                {t('about.origin.p1')}
              </p>
              <p className="mb-4">
                {t('about.origin.p2')}
              </p>
              <p>
                {t('about.origin.p3')}
              </p>
            </div>
          </div>
          <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl shadow-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-4kswCx8t_XkSGwGeDFuz7h8QmHWBhHF4iFH8StIVMlX3QcJJ4VyTYkuSf_eywSd-0bIU59IY0EHbjvx0WOuTlvvjL8dZ4QxcpSFT5RuWLzk-C-_hmPz1sKp5narUa50pOSz75f-gHS6kCwF-_HpIX3t1A8tftvosgJoZrEGxBBhcw-IE2rtcSFiznxaFHublaHtNmvRz8iSOboTbxE2nUFJHiC8afePeiPvIR5ePKUrFi3Hk5itkS5fPvtHO5dNdULbWy39CI")' }}>
          </div>
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-8 font-display">{t('about.milestones.title')}</h3>
          <div className="grid grid-cols-[32px_1fr] gap-x-4">
            {/* Timeline Item 1 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[18px]">flag</span>
              </div>
              <div className="w-[2px] bg-slate-200 dark:bg-slate-800 h-full grow my-2"></div>
            </div>
            <div className="pb-8 pt-1">
              <span className="text-xs font-bold text-primary uppercase">2018</span>
              <h4 className="text-slate-900 dark:text-white text-lg font-bold">{t('about.milestones.2018.title')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('about.milestones.2018.desc')}</p>
            </div>
            {/* Timeline Item 2 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
              <div className="w-[2px] bg-slate-200 dark:bg-slate-800 h-full grow my-2"></div>
            </div>
            <div className="pb-8 pt-1">
              <span className="text-xs font-bold text-primary uppercase">2019</span>
              <h4 className="text-slate-900 dark:text-white text-lg font-bold">{t('about.milestones.2019.title')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('about.milestones.2019.desc')}</p>
            </div>
            {/* Timeline Item 3 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[18px]">mic</span>
              </div>
              <div className="w-[2px] bg-slate-200 dark:bg-slate-800 h-full grow my-2"></div>
            </div>
            <div className="pb-8 pt-1">
              <span className="text-xs font-bold text-primary uppercase">2021</span>
              <h4 className="text-slate-900 dark:text-white text-lg font-bold">{t('about.milestones.2021.title')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('about.milestones.2021.desc')}</p>
            </div>
            {/* Timeline Item 4 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-xs font-bold text-primary uppercase">Today</span>
              <h4 className="text-slate-900 dark:text-white text-lg font-bold">{t('about.milestones.today.title')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('about.milestones.today.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full pb-10">
        <div className="flex flex-col gap-4 mb-10 text-center items-center">
          <h2 className="text-slate-900 dark:text-white text-3xl font-bold font-display">{t('about.team.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('about.team.description')}</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/20 hover:scale-[1.02] dark:bg-white/5 dark:text-white dark:hover:bg-white/10 border border-primary/20 dark:border-white/10 group">
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">smart_toy</span>
            {t('about.team.aiButton')}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Alex Morgan", role: t('about.team.roles.founder'), img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4tvjqd4ffcCL_6NYakcXCMsxIqUBlw_khxD3a7oMp4w78h0a1NJXx0hWBgmp8FBTEryrpuicgiQ8SMLtZ9JPURTXI75iXiMyrdc60Or5I2pHWQGxWY16QGceOCtDzvI5_TKmE6dMFbdei-PjlvHYIoWTG_HCx5fqLtp9_0zlq9zs40XFqogRWYZNThR3pPKnltikleaOiU57iFTjCjuWrZVi96QrZt4rQ5ZB-kC6B2peKE77JUfsCYmBTR71veQbW8RR4-1oL4Yo" },
            { name: "Sarah Jenkins", role: t('about.team.roles.leadWriter'), img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAhcTZxe0fuRvmNCFzACH-KSc4r61_cOs06SxV0wHGiJnMm6fMlMkO-cEMKFydSt8k-vF4tUdp09C8MHpsexAFpS8OvY05pUgdHkwAkyiCwgCJCJuNanNbpb2i7Vur2OQKLXGgTyJfxOLZvvrHSq7N8V1GzjO-2OcbCNvUzsQU0iSafeEitdZfwxnUdWH-tFrVKADZPpGeg9KhBUv6rEcKo0pEY4w0dYngHbRgPbjQ4yAuzN6NOir_OnxROo45hpib6TWxIHyug54" },
            { name: "David Chen", role: t('about.team.roles.analyst'), img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhiofBhO_aPmIajPaCAMDDheP8PRx6ow2WtVPWCSUD5qWdbgrngpfa4OqAqTGmZscOYo3XgM1inEkKPhUqAx1blEv7OgiHjqzQ3untY9oIblrAKyadI31k8qCoh49kx5AXKDeLyL8fYMc-b9mIr9fsoOYNJyhxY_z6HcpNRY1pr702eQDzkSKIkPQTT7qT_6n_4nVAXFWQl2XsClK3PRehVZQ-J29DxJH17YnPJmJLQzqGNfc8t6-wt2b6ohfIvSttnNDaykKcrvY" },
            { name: "Emily Ross", role: t('about.team.roles.director'), img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKtdPEeFVHXDRgNrZZig9AgW9u4RmftlP0TTcXkzdn6vMqMaNMAJS2pzrYW6zyts3NUuDHheCfNGI-RUd-yu-1o761-iG8QbBmXElDSzNwZX8Lz4B3SRKIWMk3SrqFzRrpQ62BFbaV3sxP-emetlbqBvujgiPp29cWk9ox42LEW0zz40uxB4-ExBRnD6XYSO1D-UkoDl9rKW7egqhMXCJr5_1XEENTI0wOqDVXjFcemtzfSWHHAlKfOdHRwhy8TarnjYdrHWgboOY" }
          ].map((member, i) => (
            <div key={i} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors duration-300">
              <div className="aspect-square w-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: `url('${member.img}')` }}></div>
              <div className="p-5">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <div className="flex gap-3">
                  <a href="#" className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">link</span></a>
                  <a href="#" className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">alternate_email</span></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full">
        <div className="bg-primary rounded-2xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 items-center">
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight font-display">{t('about.cta.title')}</h2>
            <p className="text-white/90 text-lg">{t('about.cta.description')}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-4">
              <input className="flex-1 h-12 rounded-lg border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-white focus:bg-white/20 px-4 transition-all" placeholder={t('about.cta.placeholder')} type="email" />
              <button className="h-12 px-8 rounded-lg bg-white text-primary font-bold hover:bg-slate-100 transition-colors shadow-lg">
                {t('about.cta.button')}
              </button>
            </div>
            <p className="text-white/60 text-xs">{t('about.cta.unsubscribe')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
