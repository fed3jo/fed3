import { useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { cloudSources } from '@/lib/fed3/cloud';
import { homeCloudGuideUrl } from '@/lib/fed3/cloud-guide';
import type { CloudScreenshotId } from '@/lib/fed3/cloud-screenshots';
import { CloudScreenshot } from './CloudScreenshot';
import styles from './trial.module.css';

type TrialStep = {
  title: string;
  detail: string;
  shot?: CloudScreenshotId;
  commands?: string[];
  links?: [string, string][];
};

const steps: Record<Locale, TrialStep[]> = {
  ar: [
    {title:'جهّزوا جهاز Linux',detail:'انسخوا ملفات الجهاز والفلاشة أولًا. إذا بدكم نظامًا جديدًا، نزّلوا ملف Lubuntu، اختاروه مع الفلاشة في Rufus، ثم أقلعوا منها واختاروا Install Lubuntu. خيار Erase Disk بمسح القرص المختار.',shot:'lubuntu',links:[['تنزيل Lubuntu','https://lubuntu.me/downloads/'],['Rufus لفلاشة الإقلاع على Windows','https://rufus.ie/']]},
    {title:'ثبّتوا Nextcloud',detail:'على جهاز الخادم، افتحوا Terminal وثبّتوا Nextcloud عبر Snap. إذا أمر snap غير متوفر على Lubuntu، ثبّتوا snapd أولًا.',commands:['sudo apt update && sudo apt install snapd','sudo snap install nextcloud','snap changes nextcloud'],links:[['تعليمات Nextcloud Snap',cloudSources.snap]]},
    {title:'افتحوا السحابة لأول مرة',detail:'على الخادم افتحوا http://localhost وأنشئوا حساب المسؤول. شغّلوا الأمر أدناه لمعرفة عنوان الخادم داخل الشبكة. للاتصال من جهاز آخر، بدّلوا عنوان المثال بعنوان الخادم، واستعملوا الخانة 1 إذا كانت فاضية. اضبطوا HTTPS قبل استخدام بيانات العمل.',commands:['hostname -I', 'sudo nextcloud.occ config:system:get trusted_domains', 'sudo nextcloud.occ config:system:set trusted_domains 1 --value="192.168.1.15"'],links:[['إعداد العنوان المحلي',cloudSources.snap + '/Hosts-and-FQDN-for-Nextcloud-snap'] ]},
    {title:'ارفعوا أول ملف',detail:'من Files اختاروا New ثم Upload files. ارفعوا ملفًا تجريبيًا، افتحوه، ثم شاركوه مع حساب آخر وجرّبوا صلاحية العرض.',shot:'upload',links:[['شرح الملفات والمشاركة',cloudSources.daily]]},
    {title:'جرّبوا من الموبايل أو الكمبيوتر',detail:'نزّلوا تطبيق Nextcloud، واكتبوا عنوان الخادم اللي أعطاكم إياه المسؤول، ثم سجّلوا الدخول. اختاروا مجلد التجربة وافتحوا الملف من الجهاز الثاني.',shot:'files',links:[['تنزيل تطبيق Nextcloud',cloudSources.clients]]},
  ],
  en: [
    {title:'Prepare a Linux device',detail:'Back up the computer and USB drive first. If you need a new system, download the Lubuntu image, select it and the USB drive in Rufus, then boot from USB and choose Install Lubuntu. Erase Disk wipes the selected drive.',shot:'lubuntu',links:[['Download Lubuntu','https://lubuntu.me/downloads/'],['Create the USB on Windows with Rufus','https://rufus.ie/']]},
    {title:'Install Nextcloud',detail:'On the server, open Terminal and install Nextcloud through Snap. If Lubuntu does not have the snap command, install snapd first.',commands:['sudo apt update && sudo apt install snapd','sudo snap install nextcloud','snap changes nextcloud'],links:[['Nextcloud Snap instructions',cloudSources.snap]]},
    {title:'Open your cloud for the first time',detail:'On the server, open http://localhost and create the administrator account. Run the command below to find the server’s local address. To connect another device, replace the example IP with your server address and use slot 1 if it is free. Set up HTTPS before using work data.',commands:['hostname -I', 'sudo nextcloud.occ config:system:get trusted_domains', 'sudo nextcloud.occ config:system:set trusted_domains 1 --value="192.168.1.15"'],links:[['Configure the local address',cloudSources.snap + '/Hosts-and-FQDN-for-Nextcloud-snap']]},
    {title:'Upload your first file',detail:'In Files, select New, then Upload files. Upload a sample file, open it, then share it with another account and check that it can view the file.',shot:'upload',links:[['Files and sharing guide',cloudSources.daily]]},
    {title:'Try a phone or computer',detail:'Download the Nextcloud app, enter the server address provided by your administrator, then sign in. Choose your test folder and open your file from the second device.',shot:'files',links:[['Download the Nextcloud app',cloudSources.clients]]},
  ],
};

export function CloudTrialGuide({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const [active, setActive] = useState(0);
  const list = steps[locale];
  const step = list[active];
  return <section id="cloud-trial" tabIndex={-1} className={styles.trial} aria-labelledby="cloud-trial-heading">
    <div className={styles.heading}>
      <div><h2 id="cloud-trial-heading">{ar ? <>نزّلوا Nextcloud <mark>وجرّبوا أول ملف</mark></> : <>Install Nextcloud and <mark>try your first file</mark></>}</h2>
        <p>{ar ? 'ابدأوا داخل شبكة المؤسسة، بملف للتجربة.' : 'Start on your local network with a sample file.'}</p></div>
      <a href={homeCloudGuideUrl} target="_blank" rel="noopener noreferrer">{ar ? 'دليل المبادرة المصوّر' : 'Illustrated initiative guide'} ↗</a>
    </div>
    <div className={styles.workspace}>
      <ol className={styles.steps} aria-label={ar ? 'خطوات التجربة' : 'Trial steps'}>
        {list.map(({title},index) => <li key={title}><button type="button" aria-label={title} aria-current={active===index?'step':undefined} onClick={() => setActive(index)}><bdi>{index+1}</bdi><span>{title}</span></button></li>)}
      </ol>
      <div className={styles.detail} aria-live="polite">
        <p className={styles.position}>{ar ? 'الخطوة' : 'Step'} <bdi>{active + 1} / {list.length}</bdi></p>
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
        {step.commands && <div className={styles.commands}>{step.commands.map(command => <pre key={command} dir="ltr"><code>{command}</code></pre>)}</div>}
        {step.shot && <CloudScreenshot id={step.shot} locale={locale} sizes="(max-width: 790px) 85vw, 58vw" />}
        <div className={styles.links}>{step.links?.map(([label,href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
        <div className={styles.buttons}>
          <button type="button" onClick={() => setActive(active - 1)} disabled={active === 0}>{ar ? 'الخطوة السابقة' : 'Previous step'}</button>
          <button type="button" onClick={() => setActive(active + 1)} disabled={active === list.length - 1}>{ar ? 'الخطوة التالية' : 'Next step'}</button>
        </div>
      </div>
    </div>
  </section>;
}
