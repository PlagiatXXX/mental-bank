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
          тренажёр уверенности, работающий на вашем устройстве.
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
            вы создаёте в Приложении.
          </li>
        </ul>
        <p>
          Все эти данные хранятся <strong className="text-slate-200">только
          на вашем устройстве</strong> (в локальном хранилище браузера
          или WebView) и никуда не передаются.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          3. Передача данных третьим лицам
        </h2>
        <p>
          Приложение работает полностью офлайн. Мы не собираем, не
          продаём и не передаём ваши данные третьим лицам. Приложение
          не содержит рекламных SDK, трекеров и аналитики. У нас нет
          серверов, на которые могли бы попасть ваши данные.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          4. Хранение и безопасность
        </h2>
        <p>
          Данные хранятся локально в хранилище вашего устройства и не
          покидают его. Это означает, что доступ к вашим записям есть
          только у вас. Удаление Приложения или очистка данных браузера
          приводит к безвозвратному удалению всех записей.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          5. Ваши права
        </h2>
        <p>
          Вы можете в любой момент удалить свои записи в интерфейсе
          Приложения (меню профиля → «Сбросить все данные»). Для
          полного удаления всех данных достаточно очистить данные
          приложения в настройках устройства.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          6. Контакты
        </h2>
        <p>
          Разработчик Приложения — физическое лицо.
          По вопросам обработки данных пишите на адрес:
        </p>
        <p className="text-amber-400"><a href="mailto:fedorpasyada@yandex.ru" className="underline decoration-amber-400/40 hover:decoration-amber-400">fedorpasyada@yandex.ru</a></p>
      </section>

      <p className="pt-4 text-sm text-slate-500">
        Настоящая политика может обновляться. Актуальная версия всегда
        доступна по адресу этой страницы.
      </p>
    </div>
  );
}
