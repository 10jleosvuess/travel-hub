(function () {

  "use strict";

  const LEAFLET_CSS =
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

  const LEAFLET_JS =
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  let map =
    null;

  let markerLayer =
    null;

  let routeLine =
    null;

  let geocodeRun =
    0;

  let leafletPromise =
    null;

  const geocodeCache =
    new Map();


  function addStyles() {

    if (
      document.getElementById(
        "travelHubRouteStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "travelHubRouteStyles";

    style.textContent = `
      .th-route-panel {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,0.13);
      }

      .th-route-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }

      .th-route-head strong {
        font-size: 14px;
      }

      .th-route-head span {
        color: rgba(255,255,255,0.58);
        font-size: 10px;
      }

      #thDayRouteMap {
        width: 100%;
        height: 310px;
        overflow: hidden;
        border-radius: 17px;
        background: #e9e6df;
      }

      .th-route-status {
        margin-top: 8px;
        color: rgba(255,255,255,0.58);
        font-size: 10px;
        line-height: 1.55;
      }

      .th-route-overview {
        display: grid;
        gap: 7px;
        margin-top: 11px;
      }

      .th-route-stop {
        width: 100%;
        display: grid;
        grid-template-columns: 30px 58px 1fr;
        gap: 8px;
        align-items: center;
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 12px;
        padding: 8px 9px;
        background: rgba(255,255,255,0.07);
        color: white;
        text-align: left;
      }

      .th-route-stop:hover {
        background: rgba(255,255,255,0.11);
      }

      .th-route-number {
        width: 27px;
        height: 27px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: white;
        color: #2e2d29;
        font-size: 11px;
        font-weight: 850;
      }

      .th-route-time {
        color: rgba(255,255,255,0.67);
        font-size: 10px;
        font-weight: 700;
      }

      .th-route-copy {
        min-width: 0;
      }

      .th-route-title {
        display: block;
        overflow: hidden;
        color: white;
        font-size: 11px;
        font-weight: 800;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .th-route-place {
        display: block;
        overflow: hidden;
        margin-top: 2px;
        color: rgba(255,255,255,0.55);
        font-size: 9px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .th-route-empty {
        padding: 14px;
        border: 1px dashed rgba(255,255,255,0.18);
        border-radius: 13px;
        color: rgba(255,255,255,0.60);
        text-align: center;
        font-size: 10px;
        line-height: 1.6;
      }

      .th-route-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .th-route-action {
        border: 0;
        border-radius: 11px;
        padding: 9px 11px;
        background: white;
        color: #2e2d29;
        font-size: 10px;
        font-weight: 750;
      }

      .th-route-action.secondary {
        background: rgba(255,255,255,0.12);
        color: white;
      }

      .th-number-marker {
        width: 30px !important;
        height: 30px !important;
        display: grid !important;
        place-items: center;
        border: 2px solid white;
        border-radius: 999px;
        background: #2e2d29;
        color: white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.28);
        font-size: 11px;
        font-weight: 900;
      }

      @media (max-width: 650px) {
        #thDayRouteMap {
          height: 260px;
        }

        .th-route-stop {
          grid-template-columns: 28px 50px 1fr;
        }
      }
    `;

    document.head.appendChild(
      style
    );

  }


  function ensurePanel() {

    if (
      document.getElementById(
        "thDayRoutePanel"
      )
    ) {
      return;
    }

    const dayInfo =
      document.querySelector(
        ".day-info"
      );

    if (!dayInfo) {
      return;
    }

    const panel =
      document.createElement(
        "div"
      );

    panel.className =
      "th-route-panel";

    panel.id =
      "thDayRoutePanel";

    panel.innerHTML = `
      <div class="th-route-head">
        <strong>🗺️ 今日完整路線</strong>
        <span id="thRouteStopCount">0 stops</span>
      </div>

      <div id="thDayRouteMap"></div>

      <div
        class="th-route-status"
        id="thRouteStatus"
      >
        地圖會依照下方行程順序自動整理。
      </div>

      <div
        class="th-route-overview"
        id="thRouteOverview"
      ></div>

      <div class="th-route-actions">
        <button
          class="th-route-action"
          id="thOpenWholeDayRoute"
          type="button"
        >
          🧭 Google Maps 整日路線
        </button>

        <button
          class="th-route-action secondary"
          id="thRefreshRouteMap"
          type="button"
        >
          ↻ 重新定位地點
        </button>
      </div>
    `;

    dayInfo.appendChild(
      panel
    );

    document.getElementById(
      "thOpenWholeDayRoute"
    ).addEventListener(
      "click",
      openWholeDayRoute
    );

    document.getElementById(
      "thRefreshRouteMap"
    ).addEventListener(
      "click",
      refreshAllCoordinates
    );

    document.getElementById(
      "thRouteOverview"
    ).addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            ".th-route-stop"
          );

        if (!button) {
          return;
        }

        const index =
          Number(
            button.dataset.index
          );

        const cards =
          document.querySelectorAll(
            ".activity-card"
          );

        const card =
          cards[index];

        if (!card) {
          return;
        }

        card.scrollIntoView(
          {
            behavior:
              "smooth",
            block:
              "center"
          }
        );

      }
    );

  }


  function loadLeaflet() {

    if (
      window.L
    ) {
      return Promise.resolve();
    }

    if (
      leafletPromise
    ) {
      return leafletPromise;
    }

    leafletPromise =
      new Promise(
        (
          resolve,
          reject
        ) => {

          if (
            !document.querySelector(
              'link[data-th-leaflet="1"]'
            )
          ) {

            const link =
              document.createElement(
                "link"
              );

            link.rel =
              "stylesheet";

            link.href =
              LEAFLET_CSS;

            link.dataset.thLeaflet =
              "1";

            document.head.appendChild(
              link
            );

          }

          const existing =
            document.querySelector(
              'script[data-th-leaflet="1"]'
            );

          if (existing) {

            existing.addEventListener(
              "load",
              resolve,
              {
                once: true
              }
            );

            existing.addEventListener(
              "error",
              reject,
              {
                once: true
              }
            );

            return;

          }

          const script =
            document.createElement(
              "script"
            );

          script.src =
            LEAFLET_JS;

          script.dataset.thLeaflet =
            "1";

          script.onload =
            resolve;

          script.onerror =
            reject;

          document.head.appendChild(
            script
          );

        }
      );

    return leafletPromise;

  }


  function getDay() {

    try {

      return currentDayData();

    }
    catch {

      return null;

    }

  }


  function getActivities() {

    const day =
      getDay();

    if (
      !day ||
      !Array.isArray(
        day.activities
      )
    ) {
      return [];
    }

    return day.activities;

  }


  function locationQuery(
    activity
  ) {

    const place =
      activity.place?.trim() ||
      "";

    if (place) {
      return place;
    }

    const title =
      activity.title?.trim() ||
      "";

    if (!title) {
      return "";
    }

    const day =
      getDay();

    const city =
      day?.city?.trim() ||
      "";

    if (city) {
      return (
        title +
        ", " +
        city
      );
    }

    return title;

  }


  function hasCoordinates(
    activity
  ) {

    if (
      activity.routeLat === null ||
      activity.routeLat === undefined ||
      activity.routeLat === "" ||
      activity.routeLng === null ||
      activity.routeLng === undefined ||
      activity.routeLng === ""
    ) {
      return false;
    }

    return (
      Number.isFinite(
        Number(
          activity.routeLat
        )
      ) &&
      Number.isFinite(
        Number(
          activity.routeLng
        )
      )
    );

  }


  function invalidateCoordinates(
    activity
  ) {

    activity.routeLat =
      null;

    activity.routeLng =
      null;

    activity.routeGeoQuery =
      "";

    activity.routeGeoFailed =
      false;

  }


  function sleep(
    milliseconds
  ) {

    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          milliseconds
        )
    );

  }


  function escapeHtml(
    value = ""
  ) {

    return String(value)
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


  async function geocode(
    query
  ) {

    const cacheKey =
      query
        .trim()
        .toLowerCase();

    if (
      geocodeCache.has(
        cacheKey
      )
    ) {

      return geocodeCache.get(
        cacheKey
      );

    }

    const url =
      "https://nominatim.openstreetmap.org/search" +
      "?format=jsonv2" +
      "&limit=1" +
      "&accept-language=zh-TW" +
      "&q=" +
      encodeURIComponent(
        query
      );

    const response =
      await fetch(
        url,
        {
          headers: {
            "Accept":
              "application/json"
          }
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        "Geocoding failed: " +
        response.status
      );
    }

    const results =
      await response.json();

    let result =
      null;

    if (
      Array.isArray(
        results
      ) &&
      results.length > 0
    ) {

      const lat =
        Number(
          results[0].lat
        );

      const lng =
        Number(
          results[0].lon
        );

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {

        result = {
          lat,
          lng
        };

      }

    }

    geocodeCache.set(
      cacheKey,
      result
    );

    return result;

  }


  async function geocodeMissing(
    force = false
  ) {

    const run =
      ++geocodeRun;

    const dayAtStart =
      typeof currentDay ===
      "number"
        ?
        currentDay
        :
        null;

    const activities =
      getActivities();

    const candidates =
      activities.filter(
        activity =>
          locationQuery(
            activity
          )
      );

    let changed =
      false;

    for (
      let index = 0;
      index < candidates.length;
      index++
    ) {

      if (
        run !==
        geocodeRun
      ) {
        return;
      }

      if (
        dayAtStart !== null &&
        currentDay !==
        dayAtStart
      ) {
        return;
      }

      const activity =
        candidates[index];

      const query =
        locationQuery(
          activity
        );

      const sameQuery =
        activity.routeGeoQuery ===
        query;

      if (
        !force &&
        sameQuery &&
        (
          hasCoordinates(
            activity
          ) ||
          activity.routeGeoFailed
        )
      ) {
        continue;
      }

      setStatus(
        "正在定位：" +
        query
      );

      try {

        const result =
          await geocode(
            query
          );

        activity.routeGeoQuery =
          query;

        if (result) {

          activity.routeLat =
            result.lat;

          activity.routeLng =
            result.lng;

          activity.routeGeoFailed =
            false;

        }
        else {

          activity.routeLat =
            null;

          activity.routeLng =
            null;

          activity.routeGeoFailed =
            true;

        }

        changed =
          true;

      }
      catch (
        error
      ) {

        console.error(
          "Daily route geocoding:",
          error
        );

        activity.routeGeoQuery =
          query;

        activity.routeGeoFailed =
          true;

        changed =
          true;

      }

      renderPanel(
        false
      );

      if (
        index <
        candidates.length - 1
      ) {

        await sleep(
          1100
        );

      }

    }

    if (
      run !==
      geocodeRun
    ) {
      return;
    }

    if (
      dayAtStart !== null &&
      currentDay !==
      dayAtStart
    ) {
      return;
    }

    if (
      changed
    ) {

      try {
        scheduleCloudSave();
      }
      catch (
        error
      ) {
        console.error(
          error
        );
      }

    }

    renderPanel(
      false
    );

  }


  function setStatus(
    message
  ) {

    const status =
      document.getElementById(
        "thRouteStatus"
      );

    if (status) {
      status.textContent =
        message;
    }

  }


  async function ensureMap() {

    try {

      await loadLeaflet();

    }
    catch (
      error
    ) {

      console.error(
        "Leaflet:",
        error
      );

      setStatus(
        "地圖元件載入失敗，但下方行程順序仍可使用。"
      );

      return null;

    }

    if (
      map
    ) {
      return map;
    }

    const element =
      document.getElementById(
        "thDayRouteMap"
      );

    if (
      !element ||
      !window.L
    ) {
      return null;
    }

    map =
      L.map(
        element,
        {
          zoomControl:
            true,
          attributionControl:
            true
        }
      );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom:
          19,
        attribution:
          "&copy; OpenStreetMap"
      }
    )
      .addTo(
        map
      );

    markerLayer =
      L.layerGroup()
        .addTo(
          map
        );

    map.setView(
      [42.7, 12.5],
      5
    );

    return map;

  }


  function markerIcon(
    number
  ) {

    return L.divIcon(
      {
        className:
          "th-number-marker",
        html:
          String(number),
        iconSize:
          [30, 30],
        iconAnchor:
          [15, 15]
      }
    );

  }


  async function drawMap() {

    const activeMap =
      await ensureMap();

    if (
      !activeMap ||
      !markerLayer
    ) {
      return;
    }

    markerLayer.clearLayers();

    if (
      routeLine
    ) {

      routeLine.remove();

      routeLine =
        null;

    }

    const activities =
      getActivities();

    const points =
      [];

    activities.forEach(
      (
        activity,
        index
      ) => {

        if (
          !hasCoordinates(
            activity
          )
        ) {
          return;
        }

        const lat =
          Number(
            activity.routeLat
          );

        const lng =
          Number(
            activity.routeLng
          );

        const marker =
          L.marker(
            [lat, lng],
            {
              icon:
                markerIcon(
                  index + 1
                )
            }
          );

        const name =
          activity.title?.trim() ||
          activity.place?.trim() ||
          (
            "行程 " +
            (index + 1)
          );

        let popup =
          "<strong>" +
          escapeHtml(
            name
          ) +
          "</strong>";

        if (
          activity.time
        ) {
          popup +=
            "<br>" +
            escapeHtml(
              activity.time
            );
        }

        if (
          activity.place
        ) {
          popup +=
            "<br>" +
            escapeHtml(
              activity.place
            );
        }

        marker.bindPopup(
          popup
        );

        marker.addTo(
          markerLayer
        );

        points.push(
          [lat, lng]
        );

      }
    );

    if (
      points.length >= 2
    ) {

      routeLine =
        L.polyline(
          points,
          {
            color:
              "#5f554a",
            weight:
              4,
            opacity:
              0.76,
            dashArray:
              "8 7"
          }
        )
          .addTo(
            activeMap
          );

    }

    if (
      points.length > 0
    ) {

      activeMap.fitBounds(
        L.latLngBounds(
          points
        ),
        {
          padding:
            [32, 32],
          maxZoom:
            14
        }
      );

    }
    else {

      activeMap.setView(
        [42.7, 12.5],
        5
      );

    }

    setTimeout(
      () => {
        activeMap.invalidateSize();
      },
      50
    );

  }


  function renderOverview() {

    const overview =
      document.getElementById(
        "thRouteOverview"
      );

    const count =
      document.getElementById(
        "thRouteStopCount"
      );

    if (
      !overview ||
      !count
    ) {
      return;
    }

    const activities =
      getActivities();

    count.textContent =
      activities.length +
      (
        activities.length === 1
          ?
          " stop"
          :
          " stops"
      );

    if (
      activities.length === 0
    ) {

      overview.innerHTML = `
        <div class="th-route-empty">
          新增行程後，這裡會自動顯示今天的完整順序。
        </div>
      `;

      return;
    }

    overview.innerHTML =
      activities
        .map(
          (
            activity,
            index
          ) => {

            const title =
              activity.title?.trim() ||
              activity.place?.trim() ||
              "未命名行程";

            const place =
              activity.place?.trim() ||
              activity.type ||
              "";

            return `
              <button
                class="th-route-stop"
                type="button"
                data-index="${index}"
              >
                <span class="th-route-number">
                  ${index + 1}
                </span>

                <span class="th-route-time">
                  ${escapeHtml(
                    activity.time ||
                    "--:--"
                  )}
                </span>

                <span class="th-route-copy">
                  <span class="th-route-title">
                    ${escapeHtml(title)}
                  </span>

                  <span class="th-route-place">
                    ${escapeHtml(place)}
                  </span>
                </span>
              </button>
            `;

          }
        )
        .join("");

  }


  function normalStatusText() {

    const activities =
      getActivities();

    if (
      activities.length === 0
    ) {
      return "新增行程後，地圖會依照行程順序自動生成。";
    }

    const locatable =
      activities.filter(
        activity =>
          locationQuery(
            activity
          )
      );

    if (
      locatable.length === 0
    ) {
      return "目前行程還沒有地名 / 地址；填入後就會出現在地圖。";
    }

    const mapped =
      locatable.filter(
        hasCoordinates
      );

    const failed =
      locatable.filter(
        activity =>
          activity.routeGeoFailed
      );

    let message =
      "已定位 " +
      mapped.length +
      " / " +
      locatable.length +
      " 個地點。";

    if (
      failed.length > 0
    ) {

      message +=
        " 有 " +
        failed.length +
        " 個地點找不到，請把地名 / 地址寫得更完整。";

    }

    if (
      mapped.length >= 2
    ) {

      message +=
        " 虛線只代表行程順序；實際道路請按 Google Maps 整日路線。";

    }

    if (
      locatable.length > 10
    ) {

      message +=
        " Google Maps 按鈕會使用前 10 個有地點的行程。";

    }

    return message;

  }


  function renderPanel(
    startGeocoding = true
  ) {

    ensurePanel();

    renderOverview();

    setStatus(
      normalStatusText()
    );

    drawMap();

    if (
      startGeocoding
    ) {
      geocodeMissing();
    }

  }


  function wholeDayGoogleMapsUrl() {

    const points =
      getActivities()
        .map(
          activity =>
            locationQuery(
              activity
            )
        )
        .filter(Boolean)
        .slice(
          0,
          10
        );

    if (
      points.length === 0
    ) {
      return "";
    }

    if (
      points.length === 1
    ) {

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          points[0]
        )
      );

    }

    const origin =
      points[0];

    const destination =
      points[
        points.length - 1
      ];

    const waypoints =
      points.slice(
        1,
        -1
      );

    let url =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" +
      encodeURIComponent(
        origin
      ) +
      "&destination=" +
      encodeURIComponent(
        destination
      ) +
      "&travelmode=driving";

    if (
      waypoints.length > 0
    ) {

      url +=
        "&waypoints=" +
        encodeURIComponent(
          waypoints.join("|")
        );

    }

    return url;

  }


  function openWholeDayRoute() {

    const url =
      wholeDayGoogleMapsUrl();

    if (!url) {

      alert(
        "今天還沒有可以放進地圖的地點。"
      );

      return;

    }

    window.open(
      url,
      "_blank",
      "noopener"
    );

  }


  function refreshAllCoordinates() {

    getActivities()
      .forEach(
        activity => {
          invalidateCoordinates(
            activity
          );
        }
      );

    renderPanel(
      false
    );

    geocodeMissing(
      true
    );

  }


  function activityForCard(
    card
  ) {

    if (!card) {
      return null;
    }

    const cards =
      Array.from(
        document.querySelectorAll(
          ".activity-card"
        )
      );

    const index =
      cards.indexOf(
        card
      );

    if (
      index < 0
    ) {
      return null;
    }

    return getActivities()[
      index
    ] || null;

  }


  function installInputListeners() {

    document.addEventListener(
      "input",
      event => {

        const target =
          event.target;

        const card =
          target.closest?.(
            ".activity-card"
          );

        if (!card) {
          return;
        }

        const activity =
          activityForCard(
            card
          );

        if (!activity) {
          return;
        }

        if (
          target.classList.contains(
            "activity-place"
          )
        ) {

          invalidateCoordinates(
            activity
          );

        }

        if (
          target.classList.contains(
            "activity-title"
          ) &&
          !activity.place?.trim()
        ) {

          invalidateCoordinates(
            activity
          );

        }

        if (
          target.classList.contains(
            "time-input"
          ) ||
          target.classList.contains(
            "activity-title"
          ) ||
          target.classList.contains(
            "activity-place"
          )
        ) {

          renderOverview();

        }

      }
    );


    document.addEventListener(
      "focusout",
      event => {

        const target =
          event.target;

        if (
          !target.classList?.contains(
            "activity-place"
          ) &&
          !target.classList?.contains(
            "activity-title"
          )
        ) {
          return;
        }

        setTimeout(
          () => {
            geocodeMissing();
          },
          0
        );

      }
    );

  }


  function wrapRender() {

    if (
      typeof render !==
      "function"
    ) {

      setTimeout(
        wrapRender,
        100
      );

      return;
    }

    if (
      render.__thRouteWrapped
    ) {
      return;
    }

    const originalRender =
      render;

    const wrapped =
      function () {

        const result =
          originalRender.apply(
            this,
            arguments
          );

        setTimeout(
          () => {
            renderPanel();
          },
          0
        );

        return result;

      };

    wrapped.__thRouteWrapped =
      true;

    render =
      wrapped;

  }


  function start() {

    addStyles();

    ensurePanel();

    installInputListeners();

    wrapRender();

    renderPanel();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once: true
      }
    );

  }
  else {

    start();

  }

})();
