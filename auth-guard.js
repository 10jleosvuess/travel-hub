(function () {

  document.documentElement.style.visibility = "hidden";


  const SUPABASE_URL =
    "https://vexzdnyinfmzvcyotiuo.supabase.co";


  const SUPABASE_KEY =
    "sb_publishable_XZqhHC1vRtMVo8-SexbZoA_vaOd8tfJ";


  const SUPABASE_SCRIPT =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


  function loadScript(src) {

    return new Promise(
      (resolve, reject) => {

        const script =
          document.createElement("script");


        script.src =
          src;


        script.onload =
          resolve;


        script.onerror =
          reject;


        document.head.appendChild(
          script
        );

      }
    );

  }


  async function start() {

    if (
      !window.supabase
    ) {

      await loadScript(
        SUPABASE_SCRIPT
      );

    }


    const client =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        }
      );


    const {
      data,
      error
    } =
      await client
        .auth
        .getSession();


    if (
      error ||
      !data.session
    ) {

      window.location.replace(
        "login.html"
      );

      return;

    }


    window.travelHubSupabase =
      client;


    document.documentElement.style.visibility =
      "visible";

  }


  start()
    .catch(
      error => {

        console.error(
          error
        );


        window.location.replace(
          "login.html"
        );

      }
    );

})();
