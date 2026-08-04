import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности приложения «Ментальный банк».",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 text-[15px] leading-relaxed text-slate-300">
      <h1 className="text-2xl font-bold text-slate-100">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-slate-500">
        Последнее обновление: 4 августа 2026 года
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          1. Общие положения
        </h2>
        <p>
          Приложение «Ментальный банк» (далее — «Приложение») —
          тренажёр уверенности, работающий по адресу mentalbank.ru.
          Приложение не требует регистрации по e-mail или телефону:
          доступ к нему осуществляется по никнейму, который вы
          выбираете при первом входе.
        </p>
        <p>
          Используя Приложение, вы соглашаетесь с условиями настоящей
          Политики конфиденциальности.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          2. Какие данные мы обрабатываем
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong className="text-slate-200">Никнейм и аватар</strong> —
            для идентификации вашего профиля;
          </li>
          <li>
            <strong className="text-slate-200">Ваши записи</strong> —
            депозиты, победы, ритуалы и записи дневника ESP, которые
            вы создаёте в Приложении;
          </li>
          <li>
            <strong className="text-slate-200">Идентификатор сессии</strong> —
            cookie с уникальным идентификатором, позволяющий
            Приложению связывать записи с вашим профилем;
          </li>
          <li>
            <strong className="text-slate-200">Технические данные</strong> —
            стандартные данные журналов сервера (IP-адрес, тип
            устройства, время обращения), используемые для
            обеспечения безопасности и стабильности работы.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          3. Как мы используем данные
        </h2>
        <p>
          Данные используются исключительно для функционирования
          Приложения: сохранение и отображение ваших записей,
          восстановление профиля при повторных визитах, техническая
          поддержка.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          4. Передача данных третьим лицам
        </h2>
        <p>
          Мы не продаём и не передаём ваши данные третьим лицам.
          Приложение не содержит рекламных SDK и трекеров.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          5. Хранение и безопасность
        </h2>
        <p>
          Данные хранятся на серверах Приложения. Часть данных
          (например, отдельные настройки интерфейса) может храниться
          локально в вашем браузере. Доступ к серверу защищён;
          идентификация пользователя не привязана к персональным
          данным вроде имени, телефона или e-mail.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          6. Ваши права
        </h2>
        <p>
          Вы можете в любой момент удалить свои записи в интерфейсе
          Приложения. Для полного удаления профиля и всех связанных
          с ним данных обратитесь к разработчику по адресу:
        </p>
        <p className="text-amber-400"><a href="mailto:fedorpasyada@yandex.ru" className="underline decoration-amber-400/40 hover:decoration-amber-400">fedorpasyada@yandex.ru</a></p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          7. Контакты
        </h2>
        <p>
          Разработчик Приложения — физическое лицо.
          По вопросам обработки данных пишите на адрес:
        </p>
        <p className="text-amber-400"><a href="mailto:fedorpasyada@yandex.ru" className="underline decoration-amber-400/40 hover:decoration-amber-400">fedorpasyada@yandex.ru</a></p>
      </section>

      <p className="pt-4 text-sm text-slate-500">
        Настоящая политика может обновляться. Актуальная версия всегда
        доступна по адресу mentalbank.ru/privacy.
      </p>
    </div>
  );
}
