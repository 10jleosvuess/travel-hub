(function () {

  const SUPABASE_URL =
    "https://vexzdnyinfmzvcyotiuo.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_XZqhHC1vRtMVo8-SexbZoA_vaOd8tfJ";

  const MODULE_KEY =
    "flights";


  function injectStyle() {

    if (
      document.getElementById(
        "travelHubFlightWidgetStyle"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");


    style.id =
      "travelHubFlightWidgetStyle";


    style.textContent = `

      #travelHubFlightWidget {
        margin: 16px 0 18px;
      }

      .th-flight-card {
        position: relative;
        overflow: hidden;

        display: block;

        padding: 22px;

        border-radius: 25px;

        background:
          linear-gradient(
            135deg,
            #292824 0%,
            #4f473f 100%
          );

        color: white;

        box-shadow:
          0 10px 30px
          rgba(52,45,36,0.10);

        text-decoration: none;

        transition:
          transform .18s ease,
          box-shadow .18s ease;
      }

      .th-flight-card:hover {
        transform: translateY(-2px);

        box-shadow:
          0 14px 34px
          rgba(52,45,36,0.15);
      }

      .th-flight-card::after {
        content: "✈";

        position: absolute;

        top: -14px;
        right: 18px;

        font-size: 120px;

        opacity: 0.055;

        transform: rotate(-11deg);

        pointer-events: none;
      }

      .th-flight-header {
        position: relative;
        z-index: 2;

        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 12px;

        margin-bottom: 18px;
      }

      .th-flight-label {
        padding: 6px 9px;

        border: 1px solid
          rgba(255,255,255,0.22);

        border-radius: 999px;

        background:
          rgba(255,255,255,0.07);

        font-size: 9px;
        font-weight: 850;

        letter-spacing: .12em;
      }

      .th-flight-more {
        color:
          rgba(255,255,255,0.62);

        font-size: 10px;
      }

      .th-flight-route {
        position: relative;
        z-index: 2;

        display: grid;

        grid-template-columns:
          1fr auto 1fr;

        align-items: center;

        gap: 14px;
      }

      .th-flight-side:last-child {
        text-align: right;
      }

      .th-flight-code {
        font-size: 42px;
        font-weight: 900;

        line-height: 1;

        letter-spacing: .02em;
      }

      .th-flight-city {
        margin-top: 6px;

        color:
          rgba(255,255,255,0.58);

        font-size: 11px;
      }

      .th-flight-plane {
        color:
          rgba(255,255,255,0.60);

        font-size: 23px;
      }

      .th-flight-info {
        position: relative;
        z-index: 2;

        display: flex;
        flex-wrap: wrap;

        gap: 7px;

        margin-top: 18px;
      }

      .th-flight-chip {
        padding: 7px 10px;

        border-radius: 10px;

        background:
          rgba(255,255,255,0.09);

        color:
          rgba(255,255,255,0.88);

        font-size: 10px;
      }

      .th-flight-empty {
        position: relative;
        z-index: 2;

        color:
          rgba(255,255,255,0.68);

        font-size: 12px;

        line-height: 1.6;
      }

      @media
      (max-width: 520px) {

        .th-flight-card {
          padding: 19px;
        }

        .th-flight-code {
          font-size: 32px;
        }

        .th-flight-plane {
          font-size: 18px;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function normalizeData(
    data
  ) {

    const source =
      data?.flights ||
      data ||
      {};


    return {

      segments:
        Array.isArray(
          source.segments
        )
          ?
          source.segments
          :
          []

    };

  }


  function segmentDate(
    segment
  ) {

    if (
      !segment?.date
    ) {

      return null;

    }


    const time =
      segment.departureTime ||
      "00:00";


    const date =
      new Date(
        segment.date +
        "T" +
        time
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;

    }


    return date;

  }


  function getNextSegment(
    segments
  ) {

    if (
      !segments.length
    ) {

      return null;

    }


    const now =
      new Date();


    const future =
      segments
        .map(
          (
            segment,
            index
          ) => ({

            segment:
              segment,

            index:
              index,

            date:
              segmentDate(
                segment
              )

          })
        )
        .filter(
          item =>
            item.date &&
            item.date >= now
        )
        .sort(
          (
            a,
            b
          ) =>
            a.date - b.date
        );


    if (
      future.length > 0
    ) {

      return future[0].segment;

    }


    return segments[0];

  }


  function formatDate(
    dateString
  ) {

    if (!dateString) {
      return "";
    }


    const parts =
      dateString.split("-");


    if (
      parts.length !== 3
    ) {

      return dateString;

    }


    return (
      parts[1] +
      "/" +
      parts[2]
    );

  }


  function widgetHtml(
    segment
  ) {

    if (!segment) {

      return `

        <a
          class="th-flight-card"
          href="flights.html"
        >

          <div class="th-flight-header">

            <div class="th-flight-label">
              NEXT FLIGHT
            </div>

            <div class="th-flight-more">
              查看航班資訊 →
            </div>

          </div>


          <div class="th-flight-empty">

            ✈️ 尚未建立航班資料<br>
            點這裡進入航班頁新增航段

          </div>

        </a>

      `;

    }


    const from =
      segment.departureAirport ||
      "---";


    const to =
      segment.arrivalAirport ||
      "---";


    const chips =
      [];


    if (
      segment.date
    ) {

      chips.push(
        "📅 " +
        formatDate(
          segment.date
        )
      );

    }


    if (
      segment.departureTime
    ) {

      chips.push(
        "🕒 " +
        segment.departureTime
      );

    }


    const flight =
      [
        segment.airline,
        segment.flightNo
      ]
        .filter(Boolean)
        .join(" ");


    if (
      flight
    ) {

      chips.push(
        "✈️ " +
        flight
      );

    }


    if (
      segment.departureTerminal
    ) {

      chips.push(
        "🛫 " +
        segment.departureTerminal
      );

    }


    return `

      <a
        class="th-flight-card"
        href="flights.html"
      >

        <div class="th-flight-header">

          <div class="th-flight-label">
            NEXT FLIGHT
          </div>

          <div class="th-flight-more">
            查看完整航班資訊 →
          </div>

        </div>


        <div class="th-flight-route">

          <div class="th-flight-side">

            <div class="th-flight-code">
              ${escapeHtml(from)}
            </div>

            <div class="th-flight-city">
              ${
                escapeHtml(
                  segment.departureCity ||
                  "出發"
                )
              }
            </div>

          </div>


          <div class="th-flight-plane">
            ─ ✈ ─
          </div>


          <div class="th-flight-side">

            <div class="th-flight-code">
              ${escapeHtml(to)}
            </div>

            <div class="th-flight-city">
              ${
                escapeHtml(
                  segment.arrivalCity ||
                  "抵達"
                )
              }
            </div>

          </div>

        </div>


        <div class="th-flight-info">

          ${
            chips
              .map(
                chip => `

                  <div class="th-flight-chip">
                    ${escapeHtml(chip)}
                  </div>

                `
              )
              .join("")
          }

        </div>

      </a>

    `;

  }


  function findInsertPoint() {

    const main =
      document.querySelector(
        "main"
      );


    if (!main) {
      return null;
    }


    const candidates = [

      main.querySelector(
        ".hero"
      ),

      main.querySelector(
        ".hero-card"
      ),

      main.querySelector(
        ".trip-hero"
      ),

      main.querySelector(
        ".dashboard-hero"
      )

    ]
      .filter(Boolean);


    if (
      candidates.length
    ) {

      return {
        mode:
          "after",

        element:
          candidates[0]
      };

    }


    const children =
      Array.from(
        main.children
      );


    const italyElement =
      children.find(
        element =>
          element.textContent
            ?.includes(
              "Italy 2026"
            )
      );


    if (
      italyElement
    ) {

      return {
        mode:
          "after",

        element:
          italyElement
      };

    }


    return {
      mode:
        "prepend",

      element:
        main
    };

  }


  function insertWidget(
    html
  ) {

    let wrapper =
      document.getElementById(
        "travelHubFlightWidget"
      );


    if (!wrapper) {

      wrapper =
        document.createElement(
          "section"
        );


      wrapper.id =
        "travelHubFlightWidget";


      const target =
        findInsertPoint();


      if (!target) {
        return;
      }


      if (
        target.mode ===
        "after"
      ) {

        target.element
          .insertAdjacentElement(
            "afterend",
            wrapper
          );

      }

      else {

        target.element
          .prepend(
            wrapper
          );

      }

    }


    wrapper.innerHTML =
      html;

  }


  async function start() {

    injectStyle();


    insertWidget(
      widgetHtml(null)
    );


    if (
      !window.supabase
    ) {

      return;

    }


    try {

      const client =
        window.supabase
          .createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
              auth: {
                persistSession:
                  true,

                autoRefreshToken:
                  true
              }
            }
          );


      const {
        data:
          sessionData
      } =
        await client
          .auth
          .getSession();


      if (
        !sessionData.session
      ) {

        return;

      }


      const user =
        sessionData
          .session
          .user;


      const {
        data,
        error
      } =
        await client
          .from(
            "travel_modules"
          )
          .select(
            "data"
          )
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "module_key",
            MODULE_KEY
          )
          .maybeSingle();


      if (error) {
        throw error;
      }


      const flights =
        normalizeData(
          data?.data
        );


      const next =
        getNextSegment(
          flights.segments
        );


      insertWidget(
        widgetHtml(
          next
        )
      );

    }

    catch (
      error
    ) {

      console.error(
        "Flight widget:",
        error
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  }

  else {

    start();

  }

})();
