// Auto Logout Countdown

(function () {

    // ------------------------------------------------------------------------
    // CONFIGURATION
    // ------------------------------------------------------------------------

    // Counter Textblock ID
    var COUNTDOWN_CONTROL_ID = 'TxAutoLogout';

    // Update Interval
    var UPDATE_INTERVAL_MS = 250;


    // ------------------------------------------------------------------------

    var currentUser = null;
    var autoLogoutMs = null;
    var logoutDeadline = null;

    var countdownTimer = null;
    var userCheckTimer = null;

    var eventCleanupFunctions = [];


    // ------------------------------------------------------------------------
    // TEXTBLOCK CONTROL
    // ------------------------------------------------------------------------

    function setDisplay(text) {

        var control = TcHmi.Controls.get(COUNTDOWN_CONTROL_ID);

        if (control) {
            control.setText(text);
        }
    }


    // ------------------------------------------------------------------------
    // TIME FORMAT
    // ------------------------------------------------------------------------

    function formatTime(milliseconds) {

        if (milliseconds < 0) {
            milliseconds = 0;
        }

        var totalSeconds = Math.ceil(milliseconds / 1000);

        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        if (hours > 0) {

            return String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
        }


        return String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }


    // ------------------------------------------------------------------------
    // GET CURRENT USER CONFIGURATION
    // ------------------------------------------------------------------------

    function updateUserConfiguration(resetTimer) {

        var user = TcHmi.Server.getCurrentUser();

        if (!user) {

            currentUser = null;
            autoLogoutMs = null;
            logoutDeadline = null;

            setDisplay('--:--');

            return;
        }


        var userConfig = TcHmi.Server.getCurrentUserConfig();

        if (!userConfig) {
            return;
        }


        // SAVE CURRENT USER
        currentUser = user;


        // SAVE CURRENT USER LOGOUT
        autoLogoutMs = userConfig.autoLogOffMilliSeconds;


        // NO AUTOLOG SET
        if (autoLogoutMs === null ||
            typeof autoLogoutMs !== 'number' ||
            autoLogoutMs <= 0) {

            logoutDeadline = null;

            setDisplay('--:--');

            return;
        }


        // RESET THE COUNTER EVERY TOUCH

        if (resetTimer || logoutDeadline === null) {

            logoutDeadline = Date.now() + autoLogoutMs;
        }
    }


    // ------------------------------------------------------------------------
    // USER INTERACTION
    // ------------------------------------------------------------------------

    function registerUserActivity() {

        var user = TcHmi.Server.getCurrentUser();

        if (!user) {
            return;
        }

        if (autoLogoutMs === null) {

            updateUserConfiguration(true);
            return;
        }

        logoutDeadline = Date.now() + autoLogoutMs;
    }


    // ------------------------------------------------------------------------
    // COUNTER UPDATE
    // ------------------------------------------------------------------------

    function updateCountdown() {

        var user = TcHmi.Server.getCurrentUser();

        if (!user) {

            currentUser = null;
            autoLogoutMs = null;
            logoutDeadline = null;

            setDisplay('--:--');

            return;
        }

        if (currentUser !== user) {

            updateUserConfiguration(true);
            return;
        }

        if (logoutDeadline === null) {

            setDisplay('--:--');
            return;
        }


        var remaining = logoutDeadline - Date.now();

        if (remaining <= 0) {

            setDisplay('00:00');

            return;
        }


        setDisplay(formatTime(remaining));
    }


    // ------------------------------------------------------------------------
    // USER INTERACTION
    // ------------------------------------------------------------------------

    function registerActivityListeners() {

        var events = [
            'pointerdown',
            'keydown',
            'wheel',
            'touchstart'
        ];


        events.forEach(function (eventName) {

            var handler = function () {
                registerUserActivity();
            };


            document.addEventListener(
                eventName,
                handler,
                true
            );


            eventCleanupFunctions.push(function () {

                document.removeEventListener(
                    eventName,
                    handler,
                    true
                );

            });

        });
    }


    // ------------------------------------------------------------------------
    // LOGIN
    // ------------------------------------------------------------------------

    function registerHmiEvents() {

        var destroyUserChanged =
            TcHmi.EventProvider.register(
                'onUserChanged',
                function () {

                    updateUserConfiguration(true);

                }
            );


        eventCleanupFunctions.push(destroyUserChanged);


        var destroyUserDataChanged =
            TcHmi.EventProvider.register(
                'onUserDataChanged',
                function () {

                    updateUserConfiguration(true);

                }
            );


        eventCleanupFunctions.push(destroyUserDataChanged);
    }


    // ------------------------------------------------------------------------
    // INICIALIZE
    // ------------------------------------------------------------------------

    function initialize() {

        updateUserConfiguration(true);

        registerActivityListeners();

        registerHmiEvents();

        countdownTimer = setInterval(
            updateCountdown,
            UPDATE_INTERVAL_MS
        );


        userCheckTimer = setInterval(
            function () {

                var user = TcHmi.Server.getCurrentUser();

                if (!user) {

                    currentUser = null;
                    autoLogoutMs = null;
                    logoutDeadline = null;

                    setDisplay('--:--');
                }

            },
            1000
        );

        updateCountdown();
    }


    // ------------------------------------------------------------------------
    // DESTROY
    // ------------------------------------------------------------------------

    function destroy() {

        if (countdownTimer !== null) {

            clearInterval(countdownTimer);
            countdownTimer = null;
        }


        if (userCheckTimer !== null) {

            clearInterval(userCheckTimer);
            userCheckTimer = null;
        }


        eventCleanupFunctions.forEach(function (cleanup) {

            if (typeof cleanup === 'function') {
                cleanup();
            }

        });


        eventCleanupFunctions = [];

        setDisplay('--:--');
    }


    // ------------------------------------------------------------------------
    // WAITING HMI READY
    // ------------------------------------------------------------------------

    TcHmi.EventProvider.register(
        'onInitialized',
        function (event) {

            event.destroy();

            initialize();

        }
    );

})();

