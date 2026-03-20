// 1. CSS Masking & Overrides
const style = document.createElement('style');
style.innerHTML = `
    /* Anti-Flicker */
    .balance-info-block__label, .balance-item__label, .balance-item__bottom { visibility: hidden !important; }
    .ready .balance-info-block__label, .ready .balance-item__label, .ready .balance-item__bottom { visibility: visible !important; }
    
    /* Force the real-account bottom visible - overrides PocketOption hidden class */
    .ready .balance-item[data-type="demo"] .balance-item__bottom,
    .ready .balance-item[data-type="demo"] .balance-item__bottom.hidden {
        display: grid !important;
        visibility: visible !important;
    }
    /* Keep demo-account bottom hidden (we cleared its content) */
    .ready .balance-item[data-type="real"] .balance-item__bottom {
        display: none !important;
    }

    /* Remove Real Account Stats Button */
    a[href*="trading-profile"].btn-success { display: none !important; }

    /* Verified Status Color Override */
    body.is-verified-active .statuses p a { color: #24B15B !important; }

    /* Guru Orange Colors */
    body.is-guru-active .user-avatar, body.is-guru-active .profile-level, body.is-guru-active .profile-level__icon, body.is-guru-active .user-avatar.user-avatar--level-0 { color: #DE9C2B !important; }
    body.is-guru-active .your-level-badge { background-color: rgba(222, 156, 43, 0.1) !important; border: 1px solid #DE9C2B !important; }
    body.is-guru-active .your-level-badge a { color: #DE9C2B !important; font-weight: bold !important; }

`;
document.documentElement.appendChild(style);

const SVG_REAL = `<svg class="svg-icon qt-real" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M7.832 1.858C8.822 1.308 10.12 1 11.5 1c1.38 0 2.678.309 3.668.858C16.123 2.388 17 3.282 17 4.5v16.11c0 1.207-.901 2.069-1.842 2.57-.984.525-2.278.82-3.658.82s-2.673-.295-3.658-.82C6.901 22.68 6 21.818 6 20.61V4.5c0-1.218.877-2.111 1.832-2.642ZM8 7.231V8.5c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98V7.231c-.966.494-2.197.769-3.5.769S8.966 7.725 8 7.231ZM15 4.5c0 .162-.13.52-.804.894-.64.355-1.59.606-2.696.606-1.105 0-2.057-.251-2.696-.606C8.13 5.019 8 4.662 8 4.5c0-.162.13-.52.804-.894C9.444 3.251 10.394 3 11.5 3c1.105 0 2.057.251 2.696.606.674.375.804.732.804.894Zm0 6.83c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.17c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98v-1.17Zm0 4c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.17c0 .333.171.67.77.98.622.32 1.572.52 2.73.52s2.108-.2 2.73-.52c.599-.31.77-.647.77-.98v-1.17Zm0 4c-.982.466-2.222.67-3.5.67s-2.518-.204-3.5-.67v1.28c0 .108.099.441.783.806.64.341 1.597.584 2.717.584s2.076-.243 2.717-.584c.684-.365.783-.698.783-.805V19.33Z" clip-rule="evenodd"></path><path fill="currentColor" d="M16.584 21.951c.416.049.4.049.916.049 1.38 0 2.674-.295 3.658-.82.941-.501 1.842-1.363 1.842-2.57V14.5c0-1.218-.877-2.111-1.832-2.642-.99-.55-2.288-.858-3.668-.858-.515 0-.02-.082-.5 0v2c.45-.104-.044 0 .5 0 1.105 0 2.057.251 2.696.606.674.374.804.732.804.894 0 .162-.13.52-.804.894-.64.355-1.59.606-2.696.606-.544 0-.05.104-.5 0v2h.5c1.303 0 2.534-.275 3.5-.769v1.38c0 .107-.099.44-.783.805-.64.341-1.597.584-2.717.584H17l-.416 1.951ZM6 6.014A9.163 9.163 0 0 0 5.5 6c-1.38 0-2.679.309-3.668.858C.877 7.388 0 8.282 0 9.5c0 .104.006.206.019.306A1.005 1.005 0 0 0 0 10v7.61c0 1.207.901 2.069 1.842 2.57.985.525 2.278.82 3.658.82.168 0 .335-.004.5-.013v-2.003c-.163.01-.33.016-.5.016-1.12 0-2.077-.243-2.717-.584C2.099 18.05 2 17.718 2 17.61v-1.508c.966.573 2.193.897 3.5.897.168 0 .335-.005.5-.016V14.98a5.83 5.83 0 0 1-.5.021c-1.08 0-2.005-.293-2.631-.712C2.236 13.864 2 13.388 2 13v-.769c.966.494 2.197.769 3.5.769.168 0 .335-.005.5-.014v-2.003a7.43 7.43 0 0 1-.5.017c-1.105 0-2.057-.251-2.696-.606C2.13 10.02 2 9.662 2 9.5c0-.162.13-.52.804-.894C3.444 8.251 4.394 8 5.5 8c.17 0 .337.006.5.017V6.014Z"></path></svg>`;
const SVG_DEMO = `<svg class="svg-icon qt-demo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M12.034 3.115a1 1 0 0 1 .932 0l10.5 5.526a1 1 0 0 1 0 1.77l-3.887 2.046v5.47a1 1 0 0 1-.18.572l-.006.009.006-.008h-.001l-.002.003-.003.005-.01.012a2.324 2.324 0 0 1-.115.15 5.772 5.772 0 0 1-.324.365c-.282.292-.7.672-1.263 1.05-1.135.758-2.846 1.494-5.186 1.494s-4.05-.736-5.182-1.495a7.671 7.671 0 0 1-1.26-1.05 5.74 5.74 0 0 1-.438-.516l-.01-.012-.003-.006-.001-.002H5.6s.006.008.002.002l-.003-.003a1 1 0 0 1-.178-.57v-5.47L3 11.183v2.764a1 1 0 1 1-2 0v-4.42a1 1 0 0 1 .534-.886l10.5-5.526ZM4.988 9.084a.5.5 0 0 0 0 .885l7.28 3.831a.5.5 0 0 0 .465 0l7.28-3.831a.5.5 0 0 0 0-.885l-7.28-3.831a.5.5 0 0 0-.466 0l-7.28 3.83ZM7.42 13.51v4.059l.075.08c.197.204.504.487.93.773.847.567 2.174 1.157 4.07 1.157 1.894 0 3.224-.59 4.073-1.157a5.716 5.716 0 0 0 1.01-.855V13.51l-4.613 2.428a1 1 0 0 1-.932 0L7.421 13.51Z" clip-rule="evenodd"></path></svg>`;

const REAL_BUTTONS_HTML = `
    <a class="btn btn-green-v2 js-deposit-btn" href="https://pocketoption.com/en/cabinet/deposit-step-1/" data-deposit-source="header-balances-real">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.1 4.00005H13.3V3.20005C13.3 2.56353 13.0471 1.95308 12.5971 1.50299C12.147 1.05291 11.5365 0.800049 10.9 0.800049H2.9C2.26348 0.800049 1.65303 1.05291 1.20294 1.50299C0.752856 1.95308 0.5 2.56353 0.5 3.20005V12.8C0.5 13.4366 0.752856 14.047 1.20294 14.4971C1.65303 14.9472 2.26348 15.2 2.9 15.2H14.1C14.7365 15.2 15.347 14.9472 15.7971 14.4971C16.2471 14.047 16.5 13.4366 16.5 12.8V6.40005C16.5 5.76353 16.2471 5.15308 15.7971 4.70299C15.347 4.25291 14.7365 4.00005 14.1 4.00005ZM2.9 2.40005H10.9C11.1122 2.40005 11.3157 2.48433 11.4657 2.63436C11.6157 2.78439 11.7 2.98788 11.7 3.20005V4.00005H2.9C2.68783 4.00005 2.48434 3.91576 2.33431 3.76573C2.18429 3.6157 2.1 3.41222 2.1 3.20005C2.1 2.98788 2.18429 2.78439 2.33431 2.63436C2.48434 2.48433 2.68783 2.40005 2.9 2.40005ZM14.9 10.4H14.1C13.8878 10.4 13.6843 10.3158 13.5343 10.1657C13.3843 10.0157 13.3 9.81222 13.3 9.60005C13.3 9.38788 13.3843 9.18439 13.5343 9.03436C13.6843 8.88433 13.8878 8.80005 14.1 8.80005H14.9V10.4ZM14.9 7.20005H14.1C13.4635 7.20005 12.853 7.4529 12.4029 7.90299C11.9529 8.35308 11.7 8.96353 11.7 9.60005C11.7 10.2366 11.9529 10.847 12.4029 11.2971C12.853 11.7472 13.4635 12 14.1 12H14.9V12.8C14.9 13.0122 14.8157 13.2157 14.6657 13.3657C14.5157 13.5158 14.3122 13.6 14.1 13.6H2.9C2.68783 13.6 2.48434 13.5158 2.33431 13.3657C2.18429 13.2157 2.1 13.0122 2.1 12.8V5.46405C2.35701 5.55446 2.62755 5.60045 2.9 5.60005H14.1C14.3122 5.60005 14.5157 5.68433 14.6657 5.83436C14.8157 5.98439 14.9 6.18788 14.9 6.40005V7.20005Z" fill="currentColor"></path></svg>
        <span class="btn__text">Top up</span>
    </a>
    <a href="https://pocketoption.com/en/cabinet/withdrawal/" class="btn btn-blue-v2">
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.99995 8C8.52528 8 8.06126 8.14076 7.66658 8.40447C7.2719 8.66819 6.96429 9.04302 6.78264 9.48156C6.60099 9.9201 6.55346 10.4027 6.64607 10.8682C6.73867 11.3338 6.96725 11.7614 7.30289 12.0971C7.63854 12.4327 8.06618 12.6613 8.53173 12.7539C8.99729 12.8465 9.47985 12.799 9.91839 12.6173C10.3569 12.4357 10.7318 12.128 10.9955 11.7334C11.2592 11.3387 11.4 10.8747 11.4 10.4C11.4 9.76348 11.1471 9.15303 10.697 8.70294C10.2469 8.25286 9.63647 8 8.99995 8ZM8.99995 11.2C8.84173 11.2 8.68705 11.1531 8.5555 11.0652C8.42394 10.9773 8.3214 10.8523 8.26085 10.7061C8.2003 10.56 8.18446 10.3991 8.21532 10.2439C8.24619 10.0887 8.32238 9.9462 8.43427 9.83432C8.54615 9.72243 8.68869 9.64624 8.84388 9.61537C8.99906 9.5845 9.15992 9.60035 9.3061 9.6609C9.45228 9.72145 9.57722 9.82398 9.66513 9.95554C9.75303 10.0871 9.79995 10.2418 9.79995 10.4C9.79995 10.6122 9.71567 10.8157 9.56564 10.9657C9.41561 11.1157 9.21212 11.2 8.99995 11.2ZM8.43195 6.168C8.50803 6.24083 8.59775 6.29792 8.69595 6.336C8.79171 6.37832 8.89526 6.40019 8.99995 6.40019C9.10465 6.40019 9.20819 6.37832 9.30395 6.336C9.40215 6.29792 9.49187 6.24083 9.56795 6.168L11.4 4.368C11.5548 4.21311 11.6419 4.00304 11.6419 3.784C11.6419 3.56496 11.5548 3.35489 11.4 3.2C11.2451 3.04511 11.035 2.9581 10.816 2.9581C10.5969 2.9581 10.3868 3.04511 10.232 3.2L9.79995 3.672V0.8C9.79995 0.587827 9.71567 0.384344 9.56564 0.234315C9.41561 0.0842854 9.21212 0 8.99995 0C8.78778 0 8.5843 0.0842854 8.43427 0.234315C8.28424 0.384344 8.19995 0.587827 8.19995 0.8V3.672L7.76795 3.2C7.61307 3.04511 7.40299 2.9581 7.18395 2.9581C6.96491 2.9581 6.75484 3.04511 6.59995 3.2C6.44507 3.35489 6.35805 3.56496 6.35805 3.784C6.35805 4.00304 6.44507 4.21311 6.59995 4.368L8.43195 6.168ZM14.6 10.4C14.6 10.2418 14.553 10.0871 14.4651 9.95554C14.3772 9.82398 14.2523 9.72145 14.1061 9.6609C13.9599 9.60035 13.7991 9.5845 13.6439 9.61537C13.4887 9.64624 13.3461 9.72243 13.2343 9.83432C13.1224 9.9462 13.0462 10.0887 13.0153 10.2439C12.9845 10.3991 13.0003 10.56 13.0608 10.7061C13.1214 10.8523 13.2239 10.9773 13.3555 11.0652C13.4871 11.1531 13.6417 11.2 13.8 11.2C14.0121 11.2 14.2156 11.1157 14.3656 10.9657C14.5157 10.8157 14.6 10.6122 14.6 10.4ZM15.4 4.8H13C12.7878 4.8 12.5843 4.88429 12.4343 5.03431C12.2842 5.18434 12.2 5.38783 12.2 5.6C12.2 5.81217 12.2842 6.01566 12.4343 6.16569C12.5843 6.31571 12.7878 6.4 13 6.4H15.4C15.6121 6.4 15.8156 6.48429 15.9656 6.63432C16.1157 6.78434 16.2 6.98783 16.2 7.2V13.6C16.2 13.8122 16.1157 14.0157 15.9656 14.1657C15.8156 14.3157 15.6121 14.4 15.4 14.4H2.59995C2.38778 14.4 2.18429 14.3157 2.03427 14.1657C1.88424 14.0157 1.79995 13.8122 1.79995 13.6V7.2C1.79995 6.98783 1.88424 6.78434 2.03427 6.63432C2.18429 6.48429 2.38778 6.4 2.59995 6.4H4.99995C5.21212 6.4 5.41561 6.31571 5.56564 6.16569C5.71567 6.01566 5.79995 5.81217 5.79995 5.6C5.79995 5.38783 5.71567 5.18434 5.56564 5.03431C5.41561 4.88429 5.21212 4.8 4.99995 4.8H2.59995C1.96343 4.8 1.35298 5.05286 0.902895 5.50294C0.452808 5.95303 0.199951 6.56348 0.199951 7.2V13.6C0.199951 14.2365 0.452808 14.847 0.902895 15.2971C1.35298 15.7471 1.96343 16 2.59995 16H15.4C16.0365 16 16.6469 15.7471 17.097 15.2971C17.5471 14.847 17.8 14.2365 17.8 13.6V7.2C17.8 6.56348 17.5471 5.95303 17.097 5.50294C16.6469 5.05286 16.0365 4.8 15.4 4.8ZM3.39995 10.4C3.39995 10.5582 3.44687 10.7129 3.53478 10.8445C3.62268 10.976 3.74762 11.0786 3.8938 11.1391C4.03999 11.1997 4.20084 11.2155 4.35602 11.1846C4.51121 11.1538 4.65375 11.0776 4.76564 10.9657C4.87752 10.8538 4.95371 10.7113 4.98458 10.5561C5.01545 10.4009 4.99961 10.24 4.93905 10.0939C4.8785 9.94767 4.77597 9.82273 4.64441 9.73482C4.51285 9.64692 4.35818 9.6 4.19995 9.6C3.98778 9.6 3.7843 9.68429 3.63427 9.83432C3.48424 9.98434 3.39995 10.1878 3.39995 10.4Z" fill="currentColor"></path></svg>
    </a>
    <a href="https://pocketoption.com/en/cabinet/ajax/modal/exchange-modal/" class="btn btn-blue-v2 mfp-ajax-modal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7.1" stroke="currentColor" stroke-width="1.8"></circle><path d="M3.06408 6.3379C3.10216 6.2397 3.15925 6.14998 3.23208 6.0739L5.03208 4.2419C5.18697 4.08701 5.39704 4 5.61608 4C5.83512 4 6.04519 4.08701 6.20008 4.2419C6.35497 4.39679 6.44198 4.60686 6.44198 4.8259C6.44198 5.04494 6.35497 5.25501 6.20008 5.4099L5.72808 5.8419L7.93431 5.8419C8.14649 5.8419 8.34997 5.92619 8.5 6.07622C8.65003 6.22624 8.73431 6.42973 8.73431 6.6419C8.73431 6.85407 8.65003 7.05756 8.5 7.20759C8.34997 7.35761 8.14649 7.4419 7.93431 7.4419L5.72808 7.4419L6.20008 7.8739C6.35497 8.02879 6.44198 8.23886 6.44198 8.4579C6.44198 8.67694 6.35497 8.88701 6.20008 9.0419C6.04519 9.19679 5.83512 9.2838 5.61608 9.2838C5.39704 9.2838 5.18697 9.19679 5.03208 9.0419L3.23208 7.2099C3.15925 7.13382 3.10216 7.0441 3.06408 6.9459C3.02176 6.85014 2.99989 6.7466 2.99989 6.6419C2.99989 6.5372 3.02176 6.43366 3.06408 6.3379Z" fill="currentColor"></path><path d="M12.6701 9.94591C12.632 10.0441 12.5749 10.1338 12.5021 10.2099L10.7021 12.0419C10.5472 12.1968 10.3371 12.2838 10.1181 12.2838C9.89901 12.2838 9.68894 12.1968 9.53405 12.0419C9.37916 11.887 9.29215 11.677 9.29215 11.4579C9.29215 11.2389 9.37916 11.0288 9.53405 10.8739L10.0061 10.4419L7.79982 10.4419C7.58764 10.4419 7.38416 10.3576 7.23413 10.2076C7.0841 10.0576 6.99982 9.85409 6.99982 9.64191C6.99982 9.42974 7.0841 9.22626 7.23413 9.07623C7.38416 8.9262 7.58764 8.84191 7.79982 8.84191L10.0061 8.84191L9.53405 8.40991C9.37916 8.25503 9.29215 8.04496 9.29215 7.82591C9.29215 7.60687 9.37916 7.3968 9.53405 7.24191C9.68894 7.08703 9.89901 7.00001 10.1181 7.00001C10.3371 7.00001 10.5472 7.08703 10.7021 7.24191L12.5021 9.07391C12.5749 9.15 12.632 9.23971 12.6701 9.33791C12.7124 9.43367 12.7342 9.53722 12.7342 9.64191C12.7342 9.74661 12.7124 9.85015 12.6701 9.94591Z" fill="currentColor"></path></svg>
    </a>
`;

const DEMO_BUTTON_HTML = `
    <a class="btn btn-blue-v2 js-demo-replenish-btn" href="https://pocketoption.com/en/cabinet/ajax/modal/replenish-demo/">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span class="btn__text">Refill Demo</span>
    </a>
`;

const CURRENCY_LINK_HTML = `
    <a class="balance-item__change-currency-link mfp-ajax-modal" data-mfp-no-close="" href="https://pocketoption.com/en/cabinet/ajax/modal/change-account-currency/">USD</a>
`;

const GURU_SVG_HTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C4.28806873 0.47645208 6.26647487 1.65902484 9 5 C9 5.66 9 6.32 9 7 C9.763125 7.061875 10.52625 7.12375 11.3125 7.1875 C14 8 14 8 15.9375 10.1875 C17 13 17 13 16.375 16.1875 C15 19 15 19 12 21 C12.99 22.32 13.98 23.64 15 25 C12.875 27.0625 12.875 27.0625 10 29 C4.69387755 28.69387755 4.69387755 28.69387755 3 27 C2.67 28.65 2.34 30.3 2 32 C-1.5742977 31.67506385 -3.55712453 31.36129314 -6.375 29.0625 C-8 27 -8 27 -8 25 C-8.78375 24.896875 -9.5675 24.79375 -10.375 24.6875 C-13 24 -13 24 -15 21 C-14.74940605 16.40577752 -14.14608258 13.41965498 -11 10 C-11.66 8.68 -12.32 7.36 -13 6 C-9.91440696 3.73118159 -8.57790624 2.94548054 -4.6875 3.3125 C-3.800625 3.539375 -2.91375 3.76625 -2 4 C-1.34 2.68 -0.68 1.36 0 0 Z " fill="#DE9C2B" transform="translate(15,0)"/><path d="M0 0 C0.66 0.33 1.32 0.66 2 1 C2 1.66 2 2.32 2 3 C6.0100934 3.17864631 6.0100934 3.17864631 10 3 C10.66 2.34 11.32 1.68 12 1 C14.125 1.375 14.125 1.375 16 2 C16 5 16 5 14.375 6.75 C11.20356379 8.41917695 9.39719928 7.90591981 6 7 C5.67 6.67 5.34 6.34 5 6 C4.67 7.65 4.34 9.3 4 11 C1.0625 10.625 1.0625 10.625 -2 10 C-2.33 9.34 -2.66 8.68 -3 8 C-2.01 8 -1.02 8 0 8 C0 5.36 0 2.72 0 0 Z " fill="#7D5917" transform="translate(13,21)"/><path d="M0 0 C3 2 3 2 3.8125 3.8125 C4.06266724 6.73111783 3.35572923 8.42411446 2 11 C-1 13 -1 13 -3.625 12.75 C-4.40875 12.5025 -5.1925 12.255 -6 12 C-6.33 11.34 -6.66 10.68 -7 10 C-6.21625 9.649375 -5.4325 9.29875 -4.625 8.9375 C-1.16452728 6.38334156 -0.85463256 4.11777506 0 0 Z " fill="#7C5417" transform="translate(28,8)"/><path d="M0 0 C0 1.65 0 3.3 0 5 C-1.32 5.33 -2.64 5.66 -4 6 C-4.66 5.01 -5.32 4.02 -6 3 C-2.25 0 -2.25 0 0 0 Z " fill="#835C17" transform="translate(7,19)"/></svg>`;

// -- CONFIG ------------------------------------------------------------
let CONFIG = {
    isEnabled: true,
    isGuruEnabled: false,
    isSpoofEnabled: false,
    isVerifiedEnabled: false,
    isStreamModeEnabled: false,
    streamMaskBalance: true,
    streamMaskId: true,
    streamMaskIp: true,
    streamMaskEmail: true,
    streamEmailAlias: 'diddy@rjktrades.com',
    customName: 'QT Real',
    spBranch: '13',
    spLevel: '87',
    spExp: '14,530',
    spTrades: '113',
    spTurnover: '$21,300.00',
    spProfit: '$4,225.00'
};

// -- MAIN OBSERVER SWAP ------------------------------------------------
const observer = new MutationObserver(() => {
    observer.disconnect();
    performInstantSwap();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
});

chrome.storage.local.get(null, (data) => {
    Object.assign(CONFIG, data);
    observer.disconnect();
    performInstantSwap();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
});

chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) CONFIG[key] = changes[key].newValue;
    observer.disconnect();
    performInstantSwap();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
});

function performInstantSwap() {
    try {
        if (CONFIG.isEnabled === false) {
            if (document.body) {
                document.body.classList.remove('is-guru-active', 'is-verified-active');
                document.body.classList.add('ready');
            }
            return;
        }

        const isDemoActive = window.location.href.includes('demo');

        if (document.body) {
            if (CONFIG.isGuruEnabled) document.body.classList.add('is-guru-active');
            else document.body.classList.remove('is-guru-active');
            if (CONFIG.isVerifiedEnabled) document.body.classList.add('is-verified-active');
            else document.body.classList.remove('is-verified-active');
        }

        // Trade label spoofing
        document.querySelectorAll('.type-of-trade-label').forEach(label => {
            if (isDemoActive) {
                if (label.innerText.includes('Demo') || label.classList.contains('type-of-trade-label--demo')) {
                    label.innerText = 'You are trading on Real account';
                    label.classList.remove('type-of-trade-label--demo');
                    label.classList.add('type-of-trade-label--real');
                }
            } else {
                if (label.innerText.includes('Real') || label.classList.contains('type-of-trade-label--real')) {
                    label.innerText = 'You are trading on Demo account';
                    label.classList.remove('type-of-trade-label--real');
                    label.classList.add('type-of-trade-label--demo');
                }
            }
        });

        // Account verification override
        if (isDemoActive) {
            const statusLink = document.querySelector('.statuses p a[href*="profile_status"]');
            if (statusLink) {
                if (CONFIG.isVerifiedEnabled && statusLink.getAttribute('data-spoofed') !== 'verified') {
                    statusLink.innerHTML = '<i class="fa fa-check-circle"></i> Verified';
                    statusLink.setAttribute('data-spoofed', 'verified');
                } else if (!CONFIG.isVerifiedEnabled && statusLink.getAttribute('data-spoofed') !== 'unverified') {
                    statusLink.innerHTML = '<i class="fa fa-exclamation-triangle"></i> Unverified';
                    statusLink.setAttribute('data-spoofed', 'unverified');
                }
            }
        }

        // Guru injection
        if (CONFIG.isGuruEnabled) {
            document.querySelectorAll('.user-avatar__profile-level-icon:not([data-spoofed="guru"])').forEach(w => {
                w.innerHTML = GURU_SVG_HTML;
                w.setAttribute('data-spoofed', 'guru');
            });
            document.querySelectorAll('.user-avatar .tooltip-text').forEach(tt => {
                if (tt.innerText !== 'Guru') tt.innerText = 'Guru';
            });
            document.querySelectorAll('.your-level-badge a').forEach(badge => {
                if (badge.innerText.trim() !== 'Guru') badge.innerText = 'Guru';
            });
        }

        // Stat spoofer
        if (CONFIG.isSpoofEnabled && isDemoActive) {
            const wLevel = document.querySelector('.wreath-levels__level');
            if (wLevel && wLevel.innerText !== CONFIG.spLevel) wLevel.innerText = CONFIG.spLevel;

            const curExp = document.querySelector('.current-exp');
            if (curExp) {
                curExp.classList.remove('js-count-to');
                if (curExp.innerText !== CONFIG.spExp) curExp.innerText = CONFIG.spExp;
            }

            const nextExp = document.querySelector('.next-level-exp');
            if (nextExp && nextExp.innerText !== '15,000') nextExp.innerText = '15,000';

            const pBar = document.querySelector('.progress__bar');
            if (pBar) {
                if (pBar.parentElement) pBar.parentElement.classList.remove('js-progress');
                if (pBar.style.width !== '96.8%') pBar.style.width = '96.8%';
            }

            const redGem    = document.querySelector('.js-red-gem-count');
            const blueGem   = document.querySelector('.js-blue-gem-count');
            const greenGem  = document.querySelector('.js-green-gem-count');
            const secretGem = document.querySelector('.js-secret-gem-count');
            if (redGem    && redGem.innerText.trim()    !== '144') redGem.innerText    = '144';
            if (blueGem   && blueGem.innerText.trim()   !== '76')  blueGem.innerText   = '76';
            if (greenGem  && greenGem.innerText.trim()  !== '22')  greenGem.innerText  = '22';
            if (secretGem && secretGem.innerText.trim() !== '3')   secretGem.innerText = '3';

            const bMedal  = document.querySelector('.js-bronze-awards-current-count');
            const bMedalT = document.querySelector('.js-bronze-awards-total-count');
            const sMedal  = document.querySelector('.js-silver-awards-current-count');
            const sMedalT = document.querySelector('.js-silver-awards-total-count');
            const gMedal  = document.querySelector('.js-gold-awards-current-count');
            const gMedalT = document.querySelector('.js-gold-awards-total-count');
            if (bMedal  && bMedal.innerText  !== '103') bMedal.innerText  = '103';
            if (bMedalT && bMedalT.innerText !== '116') bMedalT.innerText = '116';
            if (sMedal  && sMedal.innerText  !== '11')  sMedal.innerText  = '11';
            if (sMedalT && sMedalT.innerText !== '18')  sMedalT.innerText = '18';
            if (gMedal  && gMedal.innerText  !== '9')   gMedal.innerText  = '9';
            if (gMedalT && gMedalT.innerText !== '25')  gMedalT.innerText = '25';

            const statSpans = document.querySelectorAll('.real-account-stats p span');
            if (statSpans.length >= 3) {
                if (statSpans[0].innerText !== CONFIG.spTrades)   statSpans[0].innerText = CONFIG.spTrades;
                if (statSpans[1].innerText !== CONFIG.spTurnover) statSpans[1].innerText = CONFIG.spTurnover;
                if (statSpans[2].innerText !== CONFIG.spProfit)   statSpans[2].innerText = CONFIG.spProfit;
            }
        }

        // Account dropdown swapper
        const topLabel   = document.querySelector('.balance-info-block__label');
        const topIconWrap = document.querySelector('.balance-info-block__icon');
        const demoItem   = document.querySelector('.balance-item[data-type="demo"]');
        const realItem   = document.querySelector('.balance-item[data-type="real"]');

        if (topLabel && topLabel.innerText !== (isDemoActive ? CONFIG.customName : 'QT Demo')) {
            topLabel.innerText = isDemoActive ? CONFIG.customName : 'QT Demo';
        }

        if (demoItem && realItem) {
            const dLabel    = demoItem.querySelector('.balance-item__label');
            const rLabel    = realItem.querySelector('.balance-item__label');
            const dIconWrap = demoItem.querySelector('.balance-item__icon');
            const rIconWrap = realItem.querySelector('.balance-item__icon');
            const dBottom   = demoItem.querySelector('.balance-item__bottom');
            const rBottom   = realItem.querySelector('.balance-item__bottom');
            const dEnd      = demoItem.querySelector('.balance-item__end');
            const rEnd      = realItem.querySelector('.balance-item__end');

            if (dLabel && dLabel.getAttribute('data-spoofed') !== CONFIG.customName) {
                // On demo page:
                //   demoItem (data-type="demo") is displayed as QT Real  -> gets real buttons + USD
                //   realItem (data-type="real") is displayed as QT Demo  -> gets nothing
                dLabel.innerText = CONFIG.customName;
                dLabel.setAttribute('data-spoofed', CONFIG.customName);
                if (rLabel) rLabel.innerText = 'QT Demo';

                if (dIconWrap && rIconWrap) {
                    const tempHTML = dIconWrap.innerHTML;
                    dIconWrap.innerHTML = rIconWrap.innerHTML;
                    rIconWrap.innerHTML = tempHTML;
                }

                // QT Real (demoItem) -> Top up + Withdraw + Exchange buttons
                if (dBottom) {
                    dBottom.classList.remove('hidden');
                    dBottom.style.display = 'grid';
                    dBottom.style.gridTemplateColumns = '4fr 1fr 1fr';
                    dBottom.style.gap = '10px';
                    dBottom.innerHTML = REAL_BUTTONS_HTML;
                }

                // QT Demo (realItem) -> no buttons, clear the bottom
                if (rBottom) {
                    rBottom.innerHTML = '';
                    rBottom.style.display = '';
                    rBottom.classList.remove('hidden');
                }

                // QT Real gets the USD currency link
                if (dEnd) dEnd.innerHTML = CURRENCY_LINK_HTML;
                // QT Demo gets no end tag
                if (rEnd) rEnd.innerHTML = '';
            }

            if (topIconWrap && !topIconWrap.hasAttribute('data-icon-synced')) {
                const correctIconSource = isDemoActive ? dIconWrap : rIconWrap;
                if (correctIconSource) topIconWrap.innerHTML = correctIconSource.innerHTML;
                topIconWrap.setAttribute('data-icon-synced', 'true');
                setTimeout(() => topIconWrap.removeAttribute('data-icon-synced'), 50);
            }
        }

        if (document.body) document.body.classList.add('ready');
    } catch (e) {
        if (document.body) document.body.classList.add('ready');
    }
}

setTimeout(() => { if (document.body) document.body.classList.add('ready'); }, 1000);

// -- STREAM MODE (1ms interval) ----------------------------------------
const BAL_MASK = '*******';
const ID_MASK  = '***';
const IP_MASK  = '***.***.***.***';

setInterval(function() {
    if (!CONFIG.isStreamModeEnabled) return;

    // Balance - target the js-hd span which holds the actual number
    if (CONFIG.streamMaskBalance) {
        document.querySelectorAll('.js-balance-real-USD, .js-balance-demo-USD, [class*="js-balance-"]').forEach(function(el) {
            if (el.innerText !== BAL_MASK) el.innerText = BAL_MASK;
        });
    }

    // Account ID
    if (CONFIG.streamMaskId) {
        document.querySelectorAll('.js-user-id, .user-id, .profile-id, .header-profile__id').forEach(function(el) {
            if (el.innerText.trim() !== ID_MASK) el.innerText = ID_MASK;
        });
    }

    // IP
    if (CONFIG.streamMaskIp) {
        document.querySelectorAll('.js-user-ip, .user-ip, .profile-ip').forEach(function(el) {
            if (el.innerText.trim() !== IP_MASK) el.innerText = IP_MASK;
        });
    }

    // Email
    if (CONFIG.streamMaskEmail) {
        const alias = CONFIG.streamEmailAlias || 'hidden@domain.com';
        document.querySelectorAll('.js-user-email, .user-email, .profile-email, .header-profile__email').forEach(function(el) {
            if (el.innerText.trim() !== alias) el.innerText = alias;
        });
    }
}, 1);

// ==========================================================================
// -- FLOATING POPOUT WIDGET + IN-PAGE EDITOR --------------------------------
// ==========================================================================

(function() {

// ------ INJECT STYLES -------------------------------------------------
function injectStyles() {
    if (document.getElementById('po-iife-styles')) return;
    var s = document.createElement('style');
    s.id = 'po-iife-styles';
    s.textContent = [
        // ------ NOTIFICATIONS ------
        '#po-notif-root{position:fixed !important;bottom:20px !important;right:20px !important;display:flex !important;flex-direction:column-reverse !important;gap:8px !important;z-index:2147483647 !important;pointer-events:none !important;width:290px !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;}',
        '.po-n{pointer-events:all !important;background:rgba(12,12,18,0.96) !important;border:1px solid rgba(191,90,242,0.18) !important;border-radius:14px !important;padding:12px 13px 14px 15px !important;display:flex !important;align-items:flex-start !important;gap:9px !important;box-shadow:0 8px 32px rgba(0,0,0,0.75),0 0 0 1px rgba(191,90,242,0.06) !important;position:relative !important;overflow:hidden !important;transform:translateX(calc(100% + 24px)) !important;opacity:0 !important;transition:transform 0.38s cubic-bezier(0.22,1,0.36,1),opacity 0.3s ease,box-shadow 0.3s ease !important;backdrop-filter:blur(20px) !important;box-sizing:border-box !important;}',
        '.po-n.po-show{transform:translateX(0) !important;opacity:1 !important;}',
        '.po-n.po-hide{transform:translateX(calc(100% + 24px)) !important;opacity:0 !important;}',
        '.po-n:hover{box-shadow:0 8px 32px rgba(0,0,0,0.75),0 0 20px rgba(191,90,242,0.25),0 0 40px rgba(255,55,95,0.1) !important;border-color:rgba(191,90,242,0.35) !important;}',
        '.po-n.po-err:hover{box-shadow:0 8px 32px rgba(0,0,0,0.75),0 0 20px rgba(255,69,58,0.3) !important;border-color:rgba(255,69,58,0.4) !important;}',
        '.po-n::before{content:"" !important;position:absolute !important;left:0 !important;top:0 !important;bottom:0 !important;width:3px !important;background:linear-gradient(180deg,#bf5af2,#ff375f) !important;border-radius:14px 0 0 14px !important;}',
        '.po-n.po-err::before{background:linear-gradient(180deg,#ff453a,#ff375f) !important;}',
        '.po-n::after{content:"" !important;position:absolute !important;top:0 !important;left:3px !important;right:0 !important;height:1px !important;background:linear-gradient(90deg,rgba(191,90,242,0.35),rgba(255,55,95,0.15),transparent 70%) !important;}',
        '.po-n.po-err::after{background:linear-gradient(90deg,rgba(255,69,58,0.35),transparent 60%) !important;}',
        '.po-n-ico{flex-shrink:0 !important;width:20px !important;height:20px !important;border-radius:50% !important;background:rgba(191,90,242,0.12) !important;display:flex !important;align-items:center !important;justify-content:center !important;margin-top:1px !important;}',
        '.po-n.po-err .po-n-ico{background:rgba(255,69,58,0.12) !important;}',
        '.po-n-body{flex:1 !important;min-width:0 !important;}',
        '.po-n-title{font-size:9.5px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:0.9px !important;margin:0 0 3px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '.po-n.po-err .po-n-title{background:linear-gradient(90deg,#ff453a,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '.po-n-desc{font-size:11px !important;color:rgba(255,255,255,0.8) !important;font-weight:500 !important;line-height:1.45 !important;margin:0 !important;}',
        '.po-n-close{flex-shrink:0 !important;background:rgba(255,255,255,0.06) !important;border:1px solid rgba(255,255,255,0.08) !important;border-radius:6px !important;padding:3px 5px !important;cursor:pointer !important;color:rgba(255,255,255,0.4) !important;font-size:10px !important;line-height:1 !important;transition:all 0.15s !important;box-shadow:none !important;transform:none !important;width:auto !important;margin:0 !important;}',
        '.po-n-close:hover{color:#fff !important;background:rgba(255,255,255,0.12) !important;transform:none !important;box-shadow:none !important;}',
        '.po-n-drain{position:absolute !important;bottom:0 !important;left:3px !important;right:0 !important;height:2px !important;background:rgba(191,90,242,0.1) !important;overflow:hidden !important;}',
        '.po-n.po-err .po-n-drain{background:rgba(255,69,58,0.1) !important;}',
        '.po-n-drain-fill{height:100% !important;width:100% !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;transform-origin:left !important;animation:po-drain 4s linear forwards !important;}',
        '.po-n.po-err .po-n-drain-fill{background:#ff453a !important;}',
        '@keyframes po-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}',

        // ------ CHANGELOG MODAL CSS ------
        '#po-cl-overlay{position:fixed !important;inset:0 !important;z-index:2147483647 !important;display:flex !important;align-items:center !important;justify-content:center !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;}',
        '#po-cl-blur{position:absolute !important;inset:0 !important;background:rgba(0,0,0,0.6) !important;backdrop-filter:blur(20px) !important;-webkit-backdrop-filter:blur(20px) !important;}',
        '#po-cl-card{position:relative !important;width:310px !important;background:rgba(12,12,20,0.98) !important;border:1px solid rgba(191,90,242,0.25) !important;border-radius:22px !important;padding:22px 20px 18px !important;box-shadow:0 0 50px rgba(191,90,242,0.15),0 24px 70px rgba(0,0,0,0.85) !important;animation:clIn 0.4s cubic-bezier(0.22,1,0.36,1) !important;overflow:visible !important;}',
        '@keyframes clIn{from{opacity:0;transform:scale(0.88) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}',
        '#po-cl-img{width:100% !important;border-radius:12px !important;margin-bottom:14px !important;display:block !important;object-fit:cover !important;max-height:130px !important;}',
        '#po-cl-badge{display:inline-flex !important;align-items:center !important;gap:6px !important;padding:3px 10px !important;background:linear-gradient(135deg,rgba(191,90,242,0.18),rgba(255,55,95,0.1)) !important;border:1px solid rgba(191,90,242,0.3) !important;border-radius:20px !important;margin-bottom:12px !important;}',
        '#po-cl-badge-dot{width:6px !important;height:6px !important;border-radius:50% !important;background:linear-gradient(135deg,#bf5af2,#ff375f) !important;box-shadow:0 0 8px rgba(191,90,242,0.9) !important;animation:clDot 1.8s ease infinite !important;flex-shrink:0 !important;}',
        '@keyframes clDot{0%,100%{box-shadow:0 0 6px rgba(191,90,242,0.8)}50%{box-shadow:0 0 16px rgba(191,90,242,1),0 0 28px rgba(255,55,95,0.5)}}',
        '#po-cl-badge-txt{font-size:9.5px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:0.8px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '#po-cl-title{font-size:20px !important;font-weight:800 !important;margin-bottom:3px !important;color:#fff !important;letter-spacing:-0.3px !important;}',
        '#po-cl-sub{font-size:11px !important;color:rgba(255,255,255,0.35) !important;margin-bottom:14px !important;font-weight:500 !important;}',
        '#po-cl-list{list-style:none !important;padding:0 !important;margin:0 0 16px !important;display:flex !important;flex-direction:column !important;gap:5px !important;}',
        '#po-cl-list li{display:flex !important;align-items:flex-start !important;gap:8px !important;font-size:11px !important;color:rgba(255,255,255,0.68) !important;font-weight:500 !important;line-height:1.4 !important;}',
        '#po-cl-list li::before{content:"" !important;width:4px !important;height:4px !important;border-radius:50% !important;background:linear-gradient(135deg,#bf5af2,#ff375f) !important;flex-shrink:0 !important;margin-top:5px !important;box-shadow:0 0 5px rgba(191,90,242,0.7) !important;}',
        '#po-cl-text{font-size:11.5px !important;color:rgba(255,255,255,0.7) !important;line-height:1.6 !important;margin:0 0 16px !important;font-weight:500 !important;}',
        '#po-cl-dismiss{width:100% !important;padding:11px !important;background:linear-gradient(135deg,#bf5af2,#ff375f) !important;border:none !important;border-radius:11px !important;color:#fff !important;font-weight:700 !important;font-size:12.5px !important;cursor:pointer !important;font-family:inherit !important;letter-spacing:0.3px !important;box-shadow:0 4px 18px rgba(191,90,242,0.35) !important;transition:opacity 0.2s,transform 0.15s !important;}',
        '#po-cl-dismiss:hover{opacity:0.87 !important;transform:translateY(-1px) !important;box-shadow:0 6px 24px rgba(191,90,242,0.5) !important;}',
        '#po-cl-dismiss:active{transform:scale(0.97) !important;}',
        '#po-cl-links{list-style:none !important;padding:0 !important;margin:0 0 16px !important;display:flex !important;flex-direction:column !important;gap:6px !important;}',
        '.po-cl-link-row{display:flex !important;}',
        '.po-cl-link{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:8px !important;width:100% !important;padding:9px 12px !important;background:rgba(191,90,242,0.07) !important;border:1px solid rgba(191,90,242,0.18) !important;border-radius:10px !important;text-decoration:none !important;color:rgba(255,255,255,0.85) !important;font-size:11.5px !important;font-weight:600 !important;transition:background 0.2s,border-color 0.2s,box-shadow 0.2s !important;}',
        '.po-cl-link:hover{background:rgba(191,90,242,0.16) !important;border-color:rgba(191,90,242,0.4) !important;box-shadow:0 0 14px rgba(191,90,242,0.2) !important;color:#fff !important;}',
        '.po-cl-link svg{flex-shrink:0 !important;opacity:0.5 !important;transition:opacity 0.2s !important;}',
        '.po-cl-link:hover svg{opacity:1 !important;}',
        '.po-cl-link-plain{font-size:11px !important;color:rgba(255,255,255,0.4) !important;font-weight:500 !important;padding:4px 2px !important;}',

        // ------ FLOATING WIDGET ------
        '#po-float{position:fixed !important;z-index:2147483646 !important;top:80px !important;right:20px !important;width:285px !important;background:rgba(10,10,16,0.97) !important;border:1px solid rgba(191,90,242,0.2) !important;border-radius:18px !important;box-shadow:0 24px 60px rgba(0,0,0,0.85),0 0 0 1px rgba(191,90,242,0.06),0 0 40px rgba(191,90,242,0.08) !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;overflow:hidden !important;user-select:none !important;backdrop-filter:blur(30px) !important;}',
        '#po-float-hdr{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:11px 13px 10px !important;background:rgba(255,255,255,0.03) !important;border-bottom:1px solid rgba(191,90,242,0.12) !important;cursor:grab !important;}',
        '#po-float-hdr:active{cursor:grabbing !important;}',
        '#po-float-ttl{font-size:10.5px !important;font-weight:700 !important;background:linear-gradient(90deg,#bf5af2,#ff375f,#00b0ff) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '#po-float-x{width:20px !important;height:20px !important;border-radius:50% !important;background:rgba(255,69,58,0.15) !important;border:1px solid rgba(255,69,58,0.3) !important;color:rgba(255,255,255,0.6) !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;font-size:11px !important;line-height:1 !important;transition:background 0.15s !important;padding:0 !important;margin:0 !important;box-shadow:none !important;transform:none !important;width:20px !important;}',
        '#po-float-x:hover{background:rgba(255,69,58,0.4) !important;transform:none !important;box-shadow:none !important;}',
        '#po-float-bdy{padding:10px 12px 12px !important;max-height:72vh !important;overflow-y:auto !important;overflow-x:hidden !important;}',
        '#po-float-bdy::-webkit-scrollbar{width:3px !important;}',
        '#po-float-bdy::-webkit-scrollbar-thumb{background:rgba(191,90,242,0.35) !important;border-radius:3px !important;}',
        '#po-float-bdy::-webkit-scrollbar-track{background:transparent !important;}',
        '#po-float-bdy .pf-row{display:flex !important;justify-content:space-between !important;align-items:center !important;margin-bottom:6px !important;background:rgba(255,255,255,0.04) !important;padding:9px 11px !important;border-radius:10px !important;border:1px solid rgba(255,255,255,0.07) !important;transition:border-color 0.2s !important;}',
        '#po-float-bdy .pf-row:hover{border-color:rgba(191,90,242,0.2) !important;}',
        '#po-float-bdy .pf-row span{font-size:12px !important;font-weight:500 !important;color:rgba(255,255,255,0.72) !important;}',
        '#po-float-bdy .pf-sw{position:relative !important;width:38px !important;height:20px !important;flex-shrink:0 !important;}',
        '#po-float-bdy .pf-sw input{opacity:0 !important;width:0 !important;height:0 !important;}',
        '#po-float-bdy .pf-sl{position:absolute !important;cursor:pointer !important;inset:0 !important;background:rgba(255,255,255,0.1) !important;border:1px solid rgba(255,255,255,0.1) !important;border-radius:20px !important;transition:all 0.25s !important;}',
        '#po-float-bdy .pf-sl:before{position:absolute !important;content:"" !important;height:14px !important;width:14px !important;left:2px !important;bottom:2px !important;background:#fff !important;border-radius:50% !important;box-shadow:0 1px 3px rgba(0,0,0,0.3) !important;transition:all 0.25s !important;}',
        '#po-float-bdy input:checked+.pf-sl{background:linear-gradient(135deg,#bf5af2,#00b0ff) !important;border-color:transparent !important;box-shadow:0 0 8px rgba(191,90,242,0.3) !important;}',
        '#po-float-bdy input:checked+.pf-sl:before{transform:translateX(18px) !important;}',
        '.pf-section{font-size:8.5px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:0.8px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;margin:10px 0 5px !important;padding-left:2px !important;}',
        '.pf-field{margin-bottom:6px !important;}',
        '.pf-field-label{font-size:8.5px !important;color:rgba(255,255,255,0.35) !important;font-weight:600 !important;text-transform:uppercase !important;letter-spacing:0.5px !important;margin-bottom:4px !important;}',
        '#po-float-bdy input[type="text"],#po-float-bdy input[type="number"]{width:100% !important;box-sizing:border-box !important;padding:7px 9px !important;font-size:11.5px !important;font-family:inherit !important;background:rgba(255,255,255,0.04) !important;border:1px solid rgba(255,255,255,0.08) !important;color:#fff !important;border-radius:8px !important;outline:none !important;transition:border-color 0.2s !important;}',
        '#po-float-bdy input:focus{border-color:rgba(191,90,242,0.45) !important;background:rgba(255,255,255,0.06) !important;}',
        '.pf-grid2{display:grid !important;grid-template-columns:1fr 1fr !important;gap:6px !important;}',
        '#pf-apply{width:100% !important;padding:10px !important;margin-top:6px !important;background:linear-gradient(135deg,#bf5af2,#ff375f) !important;border:none !important;color:#fff !important;font-weight:700 !important;font-size:11.5px !important;border-radius:10px !important;cursor:pointer !important;font-family:inherit !important;letter-spacing:0.3px !important;transition:opacity 0.2s,transform 0.15s !important;box-shadow:0 4px 14px rgba(191,90,242,0.3) !important;}',
        '#pf-apply:hover{opacity:0.88 !important;transform:translateY(-1px) !important;box-shadow:0 6px 20px rgba(191,90,242,0.45) !important;}',
        '#pf-apply:active{transform:scale(0.97) !important;}',

        // ------ EDIT MODE BAR ------
        '#po-edit-bar{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;z-index:2147483646 !important;display:flex !important;align-items:center !important;gap:8px !important;padding:10px 16px !important;background:rgba(10,10,16,0.97) !important;backdrop-filter:blur(24px) !important;border-bottom:1px solid rgba(191,90,242,0.25) !important;box-shadow:0 0 30px rgba(191,90,242,0.15),0 4px 20px rgba(0,0,0,0.5) !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;animation:editBarIn 0.3s cubic-bezier(0.22,1,0.36,1) !important;}',
        '@keyframes editBarIn{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
        '#po-edit-bar::before{content:"" !important;position:absolute !important;inset:0 !important;background:linear-gradient(90deg,rgba(191,90,242,0.06),rgba(255,55,95,0.04),rgba(191,90,242,0.06)) !important;animation:editBarPulse 3s ease infinite !important;pointer-events:none !important;}',
        '@keyframes editBarPulse{0%,100%{opacity:1}50%{opacity:0.4}}',
        '#po-edit-badge{display:flex !important;align-items:center !important;gap:6px !important;padding:4px 10px !important;background:linear-gradient(135deg,rgba(191,90,242,0.2),rgba(255,55,95,0.12)) !important;border:1px solid rgba(191,90,242,0.3) !important;border-radius:20px !important;box-shadow:0 0 12px rgba(191,90,242,0.2) !important;}',
        '#po-edit-dot{width:6px !important;height:6px !important;border-radius:50% !important;background:linear-gradient(135deg,#bf5af2,#ff375f) !important;box-shadow:0 0 6px rgba(191,90,242,0.8) !important;animation:editDotPulse 1.5s ease infinite !important;flex-shrink:0 !important;}',
        '@keyframes editDotPulse{0%,100%{box-shadow:0 0 6px rgba(191,90,242,0.8)}50%{box-shadow:0 0 14px rgba(191,90,242,1),0 0 24px rgba(255,55,95,0.5)}}',
        '#po-edit-label{font-size:10px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:0.8px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '#po-edit-hint{font-size:10px !important;color:rgba(255,255,255,0.35) !important;flex:1 !important;}',
        '.peb{padding:7px 13px !important;border-radius:9px !important;border:none !important;font-size:11px !important;font-weight:600 !important;cursor:pointer !important;font-family:inherit !important;letter-spacing:0.3px !important;transition:all 0.2s !important;}',
        '.peb:active{transform:scale(0.96) !important;}',
        '#peb-save{background:linear-gradient(135deg,#bf5af2,#ff375f) !important;color:#fff !important;box-shadow:0 2px 12px rgba(191,90,242,0.35) !important;}',
        '#peb-save:hover{box-shadow:0 4px 20px rgba(191,90,242,0.55) !important;transform:translateY(-1px) !important;}',
        '#peb-reset{background:rgba(255,69,58,0.12) !important;border:1px solid rgba(255,69,58,0.25) !important;color:rgba(255,200,200,0.85) !important;}',
        '#peb-reset:hover{background:rgba(255,69,58,0.25) !important;}',
        '#peb-cancel{background:rgba(255,255,255,0.05) !important;border:1px solid rgba(255,255,255,0.09) !important;color:rgba(255,255,255,0.55) !important;}',
        '#peb-cancel:hover{background:rgba(255,255,255,0.1) !important;color:rgba(255,255,255,0.85) !important;}',
        '#peb-explorer{background:rgba(191,90,242,0.12) !important;border:1px solid rgba(191,90,242,0.3) !important;color:#bf5af2 !important;}',
        '#peb-explorer:hover{background:rgba(191,90,242,0.25) !important;border-color:rgba(191,90,242,0.55) !important;color:#fff !important;box-shadow:0 0 12px rgba(191,90,242,0.25) !important;}',
        '.po-eh{outline:2px dashed rgba(191,90,242,0.55) !important;outline-offset:3px !important;cursor:text !important;box-shadow:0 0 12px rgba(191,90,242,0.15) !important;border-radius:4px !important;}',
        '.po-ea{outline:2px solid #bf5af2 !important;outline-offset:3px !important;cursor:text !important;box-shadow:0 0 0 4px rgba(191,90,242,0.12),0 0 20px rgba(191,90,242,0.25) !important;border-radius:4px !important;background:rgba(191,90,242,0.04) !important;}',
        '.po-dh{outline:2px dashed rgba(0,176,255,0.55) !important;outline-offset:4px !important;cursor:move !important;}',
    ].join('');
    (document.head || document.documentElement).appendChild(s);
}

// ------ NOTIF ROOT ----------------------------------------------------
function getNotifRoot() {
    injectStyles();
    var r = document.getElementById('po-notif-root');
    if (!r) {
        r = document.createElement('div');
        r.id = 'po-notif-root';
        (document.body || document.documentElement).appendChild(r);
    }
    return r;
}

// ------ PAGE NOTIFICATION ---------------------------------------------
function showPageNotif(opts) {
    var title   = (opts && opts.title) || 'pocket option config';
    var desc    = (opts && opts.desc)  || '';
    var isError = !!(opts && opts.isError);
    var root = getNotifRoot();
    var n = document.createElement('div');
    n.className = 'po-n' + (isError ? ' po-err' : '');
    var col  = isError ? '#ff453a' : '#bf5af2';
    var path = isError
        ? '<path d="M5 2.5V5.5" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round"/><circle cx="5" cy="7.5" r="0.7" fill="' + col + '"/>'
        : '<path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
    n.innerHTML =
        '<div class="po-n-ico"><svg width="10" height="10" viewBox="0 0 10 10" fill="none">' + path + '</svg></div>' +
        '<div class="po-n-body"><p class="po-n-title">' + title + '</p><p class="po-n-desc">' + desc + '</p></div>' +
        '<button class="po-n-close">x</button>' +
        '<div class="po-n-drain"><div class="po-n-drain-fill"></div></div>';
    root.appendChild(n);
    requestAnimationFrame(function() { requestAnimationFrame(function() { n.classList.add('po-show'); }); });
    var t = setTimeout(function() { dismissN(n); }, 4000);
    n.querySelector('.po-n-close').addEventListener('click', function() { clearTimeout(t); dismissN(n); });
}

function dismissN(n) {
    n.classList.remove('po-show');
    n.classList.add('po-hide');
    n.addEventListener('transitionend', function() { if (n.parentNode) n.parentNode.removeChild(n); }, { once: true });
}

// ------ FLOATING POPOUT WIDGET (full settings + free drag) ------------
function buildPopoutWidget() {
    injectStyles();
    if (!document.body) { document.addEventListener('DOMContentLoaded', buildPopoutWidget); return; }
    if (document.getElementById('po-float')) {
        document.getElementById('po-float').style.display = 'block';
        return;
    }

    function sw(id, label, color) {
        return '<div class="pf-row">' +
            '<span' + (color ? ' style="color:' + color + '"' : '') + '>' + label + '</span>' +
            '<label class="pf-sw"><input type="checkbox" id="' + id + '"><span class="pf-sl"></span></label>' +
        '</div>';
    }
    function field(id, label, placeholder, type) {
        return '<div class="pf-field">' +
            '<div class="pf-field-label">' + label + '</div>' +
            '<input type="' + (type || 'text') + '" id="' + id + '" placeholder="' + (placeholder || '') + '">' +
        '</div>';
    }
    function section(label) {
        return '<div class="pf-section">' + label + '</div>';
    }
    function grid2(a, b) {
        return '<div class="pf-grid2">' + a + b + '</div>';
    }

    var w = document.createElement('div');
    w.id = 'po-float';
    w.innerHTML =
        '<div id="po-float-hdr">' +
            '<span id="po-float-ttl">pocket option config</span>' +
            '<button id="po-float-x">x</button>' +
        '</div>' +
        '<div id="po-float-bdy">' +
            section('Main') +
            sw('pf-master', 'Swap Script') +
            sw('pf-guru',   'Guru Title') +
            field('pf-alias', 'Display Alias', 'QT Real') +

            section('Stats') +
            sw('pf-spoof',    'Enable Stat Spoof', '#ffd60a') +
            sw('pf-verified', 'Spoof Verified',    '#ffd60a') +
            grid2(
                field('pf-branch', 'Branch Lvl', '13', 'number'),
                field('pf-level',  'Disp Lvl',   '87', 'number')
            ) +
            grid2(
                field('pf-exp',    'Current XP',   '14,530'),
                field('pf-trades', 'Total Trades', '113', 'number')
            ) +
            field('pf-turnover', 'Turnover', '$21,300.00') +
            field('pf-profit',   'Profit',   '$4,225.00') +

            section('Stream') +
            sw('pf-stream',       'Stream Mode') +
            sw('pf-mask-balance', 'Hide Balance') +
            sw('pf-mask-id',      'Mask Account ID') +
            sw('pf-mask-ip',      'Mask IP Address') +
            sw('pf-mask-email',   'Replace Email') +
            field('pf-email-alias', 'Email Alias', 'hidden@domain.com') +

            '<button id="pf-apply">Apply Settings</button>' +
        '</div>';

    document.body.appendChild(w);

    var BOOL_MAP = {
        'pf-master':       'isEnabled',
        'pf-guru':         'isGuruEnabled',
        'pf-spoof':        'isSpoofEnabled',
        'pf-verified':     'isVerifiedEnabled',
        'pf-stream':       'isStreamModeEnabled',
        'pf-mask-balance': 'streamMaskBalance',
        'pf-mask-id':      'streamMaskId',
        'pf-mask-ip':      'streamMaskIp',
        'pf-mask-email':   'streamMaskEmail',
    };
    var VAL_MAP = {
        'pf-alias':       'customName',
        'pf-branch':      'spBranch',
        'pf-level':       'spLevel',
        'pf-exp':         'spExp',
        'pf-trades':      'spTrades',
        'pf-turnover':    'spTurnover',
        'pf-profit':      'spProfit',
        'pf-email-alias': 'streamEmailAlias',
    };

    chrome.storage.local.get(null, function(data) {
        Object.keys(BOOL_MAP).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.checked = !!data[BOOL_MAP[id]];
        });
        Object.keys(VAL_MAP).forEach(function(id) {
            var el = document.getElementById(id);
            if (el && data[VAL_MAP[id]] !== undefined) el.value = data[VAL_MAP[id]];
        });
    });

    document.getElementById('pf-apply').addEventListener('click', function() {
        var updates = {};
        Object.keys(BOOL_MAP).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) updates[BOOL_MAP[id]] = !!el.checked;
        });
        Object.keys(VAL_MAP).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) updates[VAL_MAP[id]] = el.value;
        });
        chrome.storage.local.set(updates, function() {
            showPageNotif({ desc: 'settings applied!' });
        });
    });

    document.getElementById('po-float-x').addEventListener('click', function() {
        w.style.display = 'none';
    });

    // Free drag — snapshots position on mousedown, no clamping
    var hdr = document.getElementById('po-float-hdr');
    var startX, startY, startLeft, startTop;
    hdr.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var rect = w.getBoundingClientRect();
        startX    = e.clientX;
        startY    = e.clientY;
        startLeft = rect.left;
        startTop  = rect.top;
        w.style.right = 'auto';
        w.style.left  = startLeft + 'px';
        w.style.top   = startTop  + 'px';
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup',   onDragEnd);
    });
    function onDrag(e) {
        w.style.left = (startLeft + e.clientX - startX) + 'px';
        w.style.top  = (startTop  + e.clientY - startY) + 'px';
    }
    function onDragEnd() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup',   onDragEnd);
    }
}


// ------ IN-PAGE EDITOR (full) -----------------------------------------
var editActive = false;
var editChanges = {};
var STORE_KEY = 'po_layout_v1';
var selectedEl = null;  // currently selected element in explorer

// ---- EDITOR CSS (injected alongside existing styles via a second tag) ----
function injectEditorStyles() {
    if (document.getElementById('po-ed-styles')) return;
    var s = document.createElement('style');
    s.id = 'po-ed-styles';
    s.textContent = [
        // --- SIDE PANEL EXPLORER ---
        '#po-explorer{position:fixed !important;top:50px !important;left:0 !important;width:260px !important;bottom:0 !important;background:rgba(8,8,14,0.97) !important;border-right:1px solid rgba(191,90,242,0.18) !important;z-index:2147483644 !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;display:flex !important;flex-direction:column !important;transition:transform 0.3s cubic-bezier(0.22,1,0.36,1) !important;box-shadow:4px 0 24px rgba(0,0,0,0.6) !important;}',
        '#po-explorer.collapsed{transform:translateX(-248px) !important;}',
        '#po-exp-toggle{position:absolute !important;right:-22px !important;top:50% !important;transform:translateY(-50%) !important;width:22px !important;height:44px !important;background:rgba(8,8,14,0.97) !important;border:1px solid rgba(191,90,242,0.18) !important;border-left:none !important;border-radius:0 8px 8px 0 !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;color:rgba(191,90,242,0.7) !important;font-size:10px !important;transition:background 0.2s !important;padding:0 !important;margin:0 !important;box-shadow:none !important;width:22px !important;}',
        '#po-exp-toggle:hover{background:rgba(191,90,242,0.12) !important;color:#bf5af2 !important;transform:translateY(-50%) !important;box-shadow:none !important;}',
        '#po-exp-hdr{padding:10px 12px 8px !important;border-bottom:1px solid rgba(191,90,242,0.12) !important;font-size:9px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:0.8px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;flex-shrink:0 !important;}',
        '#po-exp-tree{flex:1 !important;overflow-y:auto !important;overflow-x:hidden !important;padding:4px 0 !important;}',
        '#po-exp-tree::-webkit-scrollbar{width:3px !important;}',
        '#po-exp-tree::-webkit-scrollbar-thumb{background:rgba(191,90,242,0.3) !important;border-radius:3px !important;}',
        '.po-exp-node{display:flex !important;align-items:center !important;padding:3px 8px !important;cursor:pointer !important;font-size:11px !important;color:rgba(255,255,255,0.55) !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;gap:4px !important;transition:background 0.15s !important;user-select:none !important;}',
        '.po-exp-node:hover{background:rgba(191,90,242,0.08) !important;color:rgba(255,255,255,0.85) !important;}',
        '.po-exp-node.selected{background:rgba(191,90,242,0.15) !important;color:#fff !important;border-left:2px solid #bf5af2 !important;}',
        '.po-exp-arrow{flex-shrink:0 !important;width:12px !important;font-size:8px !important;color:rgba(191,90,242,0.5) !important;transition:transform 0.15s !important;}',
        '.po-exp-arrow.open{transform:rotate(90deg) !important;}',
        '.po-exp-tag{color:#bf5af2 !important;font-size:10.5px !important;font-weight:600 !important;}',
        '.po-exp-cls{color:rgba(0,176,255,0.7) !important;font-size:9.5px !important;}',
        '.po-exp-txt{color:rgba(255,255,255,0.3) !important;font-size:9.5px !important;font-style:italic !important;overflow:hidden !important;text-overflow:ellipsis !important;max-width:100px !important;}',
        '.po-exp-children{display:none !important;}',
        '.po-exp-children.open{display:block !important;}',
        // --- PROPS PANEL (bottom of explorer) ---
        '#po-exp-props{border-top:1px solid rgba(191,90,242,0.12) !important;padding:8px 10px !important;max-height:200px !important;overflow-y:auto !important;flex-shrink:0 !important;}',
        '#po-exp-props::-webkit-scrollbar{width:3px !important;}',
        '#po-exp-props::-webkit-scrollbar-thumb{background:rgba(191,90,242,0.3) !important;border-radius:3px !important;}',
        '.po-prop-row{display:flex !important;gap:6px !important;align-items:center !important;margin-bottom:5px !important;}',
        '.po-prop-key{font-size:9px !important;font-weight:600 !important;color:rgba(191,90,242,0.7) !important;text-transform:uppercase !important;letter-spacing:0.4px !important;width:52px !important;flex-shrink:0 !important;}',
        '.po-prop-val{flex:1 !important;font-size:10.5px !important;color:#fff !important;background:rgba(255,255,255,0.05) !important;border:1px solid rgba(255,255,255,0.08) !important;border-radius:5px !important;padding:3px 6px !important;outline:none !important;font-family:monospace !important;transition:border-color 0.15s !important;width:100% !important;box-sizing:border-box !important;}',
        '.po-prop-val:focus{border-color:rgba(191,90,242,0.5) !important;background:rgba(255,255,255,0.07) !important;}',
        '.po-prop-apply{padding:2px 8px !important;font-size:9.5px !important;font-weight:600 !important;background:rgba(191,90,242,0.2) !important;border:1px solid rgba(191,90,242,0.35) !important;border-radius:5px !important;color:#bf5af2 !important;cursor:pointer !important;font-family:inherit !important;white-space:nowrap !important;transition:background 0.15s !important;box-shadow:none !important;transform:none !important;padding:2px 8px !important;}',
        '.po-prop-apply:hover{background:rgba(191,90,242,0.35) !important;transform:none !important;box-shadow:none !important;}',
        // --- RIGHT-CLICK CONTEXT MENU ---
        '#po-ctx{position:fixed !important;z-index:2147483647 !important;background:rgba(10,10,18,0.98) !important;border:1px solid rgba(191,90,242,0.22) !important;border-radius:12px !important;padding:5px !important;min-width:190px !important;box-shadow:0 12px 40px rgba(0,0,0,0.8),0 0 0 1px rgba(191,90,242,0.06) !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;animation:ctxIn 0.15s cubic-bezier(0.22,1,0.36,1) !important;backdrop-filter:blur(20px) !important;}',
        '@keyframes ctxIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}',
        '.po-ctx-item{display:flex !important;align-items:center !important;gap:8px !important;padding:7px 10px !important;border-radius:8px !important;cursor:pointer !important;font-size:12px !important;font-weight:500 !important;color:rgba(255,255,255,0.75) !important;transition:background 0.12s !important;user-select:none !important;}',
        '.po-ctx-item:hover{background:rgba(191,90,242,0.12) !important;color:#fff !important;}',
        '.po-ctx-item.danger:hover{background:rgba(255,69,58,0.15) !important;color:#ff453a !important;}',
        '.po-ctx-item.code-item:hover{background:rgba(255,193,7,0.1) !important;color:#ffd60a !important;}',
        '.po-ctx-sep{height:1px !important;background:rgba(255,255,255,0.07) !important;margin:4px 5px !important;}',
        '.po-ctx-ico{font-size:13px !important;width:16px !important;text-align:center !important;}',
        // --- IMAGE EDITOR MODAL ---
        '#po-img-modal{position:fixed !important;inset:0 !important;z-index:2147483647 !important;display:flex !important;align-items:center !important;justify-content:center !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;}',
        '#po-img-backdrop{position:absolute !important;inset:0 !important;background:rgba(0,0,0,0.7) !important;backdrop-filter:blur(16px) !important;}',
        '#po-img-card{position:relative !important;width:360px !important;background:rgba(10,10,18,0.98) !important;border:1px solid rgba(191,90,242,0.25) !important;border-radius:18px !important;padding:20px !important;box-shadow:0 24px 60px rgba(0,0,0,0.85) !important;animation:clIn 0.3s cubic-bezier(0.22,1,0.36,1) !important;}',
        '#po-img-card h3{font-size:13px !important;font-weight:700 !important;margin:0 0 14px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}',
        '.po-img-row{margin-bottom:10px !important;}',
        '.po-img-lbl{font-size:9px !important;font-weight:600 !important;text-transform:uppercase !important;letter-spacing:0.5px !important;color:rgba(255,255,255,0.4) !important;margin-bottom:4px !important;}',
        '.po-img-inp{width:100% !important;box-sizing:border-box !important;padding:8px 10px !important;font-size:12px !important;font-family:monospace !important;background:rgba(255,255,255,0.04) !important;border:1px solid rgba(255,255,255,0.1) !important;color:#fff !important;border-radius:8px !important;outline:none !important;transition:border-color 0.2s !important;}',
        '.po-img-inp:focus{border-color:rgba(191,90,242,0.5) !important;}',
        '.po-img-preview{width:100% !important;height:100px !important;object-fit:contain !important;border-radius:8px !important;border:1px solid rgba(255,255,255,0.08) !important;background:rgba(255,255,255,0.03) !important;display:block !important;margin-bottom:10px !important;}',
        '.po-img-btns{display:flex !important;gap:8px !important;}',
        '.po-img-btn{flex:1 !important;padding:9px !important;border-radius:9px !important;border:none !important;font-size:11.5px !important;font-weight:700 !important;cursor:pointer !important;font-family:inherit !important;transition:opacity 0.15s !important;margin:0 !important;}',
        '.po-img-btn.primary{background:linear-gradient(135deg,#bf5af2,#ff375f) !important;color:#fff !important;box-shadow:0 4px 14px rgba(191,90,242,0.3) !important;}',
        '.po-img-btn.secondary{background:rgba(255,255,255,0.06) !important;border:1px solid rgba(255,255,255,0.1) !important;color:rgba(255,255,255,0.6) !important;}',
        '.po-img-btn:hover{opacity:0.85 !important;transform:none !important;box-shadow:none !important;}',
        // --- CUSTOM CODE MODAL ---
        '#po-code-modal{position:fixed !important;inset:0 !important;z-index:2147483647 !important;display:flex !important;align-items:center !important;justify-content:center !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;}',
        '#po-code-backdrop{position:absolute !important;inset:0 !important;background:rgba(0,0,0,0.7) !important;backdrop-filter:blur(16px) !important;}',
        '#po-code-card{position:relative !important;width:420px !important;background:rgba(10,10,18,0.98) !important;border:1px solid rgba(255,193,7,0.25) !important;border-radius:18px !important;padding:20px !important;box-shadow:0 24px 60px rgba(0,0,0,0.85) !important;animation:clIn 0.3s cubic-bezier(0.22,1,0.36,1) !important;}',
        '#po-code-warn{background:rgba(255,193,7,0.08) !important;border:1px solid rgba(255,193,7,0.2) !important;border-radius:10px !important;padding:10px 12px !important;font-size:11px !important;color:rgba(255,193,7,0.9) !important;margin-bottom:12px !important;line-height:1.5 !important;}',
        '#po-code-area{width:100% !important;box-sizing:border-box !important;height:140px !important;padding:10px !important;font-size:12px !important;font-family:monospace !important;background:rgba(0,0,0,0.4) !important;border:1px solid rgba(255,193,7,0.2) !important;color:#ffd60a !important;border-radius:9px !important;outline:none !important;resize:vertical !important;margin-bottom:10px !important;}',
        '#po-code-area:focus{border-color:rgba(255,193,7,0.5) !important;}',
        // element highlight while hovering in edit mode
        '.po-highlight{outline:2px solid rgba(191,90,242,0.6) !important;outline-offset:2px !important;cursor:context-menu !important;}',
    ].join('');
    document.documentElement.appendChild(s);
}

function inEditUI(el) {
    return !!(el && el.closest && (
        el.closest('#po-edit-bar') || el.closest('#po-explorer') ||
        el.closest('#po-float') || el.closest('#po-notif-root') ||
        el.closest('#po-ctx') || el.closest('#po-img-modal') ||
        el.closest('#po-code-modal')
    ));
}

// ---- ELEMENT SELECTOR (for storage key) ----
function getEl(el) {
    try {
        if (el.id) return '#' + el.id;
        var p = [], c = el;
        for (var i = 0; i < 5 && c && c !== document.body; i++) {
            var t = c.tagName.toLowerCase();
            var cls = (typeof c.className === 'string') ? c.className.trim().replace(/\s+/g,'.') : '';
            p.unshift(t + (cls ? '.' + cls : ''));
            c = c.parentElement;
        }
        return p.join(' > ');
    } catch(e) { return null; }
}

// ---- RIGHT-CLICK CONTEXT MENU ----
var ctxTarget = null;

function showCtxMenu(x, y, el) {
    closeCtxMenu();
    ctxTarget = el;
    var m = document.createElement('div');
    m.id = 'po-ctx';
    m.style.left = x + 'px';
    m.style.top  = y + 'px';

    var isImg = el && el.tagName === 'IMG';
    var isText = el && el.innerText && el.innerText.trim().length > 0 && !isImg;

    var items = [];
    if (isText) {
        items.push({ico:'T', label:'Edit Text', fn: function() { ctxEditText(el); }});
    }
    if (isImg) {
        items.push({ico:'IMG', label:'Edit Image / Swap URL', fn: function() { openImgModal(el); }});
    }
    items.push({ico:'M', label:'Move Element (drag)', fn: function() { ctxStartDrag(el); }});
    items.push({ico:'H', label:'Hide Element', fn: function() {
        el.style.visibility = 'hidden';
        var sel = getEl(el);
        if (sel) { editChanges[sel] = editChanges[sel] || {}; editChanges[sel].hidden = true; }
    }});
    items.push({ico:'V', label:'Show Element', fn: function() {
        el.style.visibility = 'visible';
        var sel = getEl(el);
        if (sel) { editChanges[sel] = editChanges[sel] || {}; editChanges[sel].hidden = false; }
    }});
    items.push({ico:'C', label:'Copy Selector', fn: function() {
        var sel = getEl(el);
        if (sel && navigator.clipboard) navigator.clipboard.writeText(sel);
        showPageNotif({ desc: 'selector copied!' });
    }});
    items.push('sep');
    items.push({ico:'I', label:'Inspect in Explorer', fn: function() {
        if (!document.getElementById('po-explorer')) buildExplorer();
        showExplorer();
        selectInExplorer(el);
    }});
    items.push('sep');
    items.push({ico:'<>', label:"Custom Code (don't be stupid)", cls:'code-item', fn: function() { openCodeModal(el); }});

    m.innerHTML = items.map(function(item) {
        if (item === 'sep') return '<div class="po-ctx-sep"></div>';
        return '<div class="po-ctx-item' + (item.cls ? ' ' + item.cls : '') + '" data-fn>' +
            '<span class="po-ctx-ico">' + item.ico + '</span>' +
            '<span>' + item.label + '</span>' +
        '</div>';
    }).join('');

    document.body.appendChild(m);

    // Wire up click handlers
    var fns = items.filter(function(i) { return i !== 'sep'; });
    m.querySelectorAll('[data-fn]').forEach(function(node, i) {
        node.addEventListener('click', function(e) {
            e.stopPropagation();
            closeCtxMenu();
            fns[i].fn();
        });
    });

    // Close on outside click
    setTimeout(function() {
        document.addEventListener('click', closeCtxMenu, { once: true });
    }, 0);

    // Keep menu on screen
    requestAnimationFrame(function() {
        var r = m.getBoundingClientRect();
        if (r.right > window.innerWidth)  m.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) m.style.top = (window.innerHeight - r.height - 8) + 'px';
    });
}

function closeCtxMenu() {
    var m = document.getElementById('po-ctx');
    if (m) m.parentNode.removeChild(m);
}

// ---- IMAGE EDITOR MODAL ----
function openImgModal(el) {
    var existing = document.getElementById('po-img-modal');
    if (existing) existing.parentNode.removeChild(existing);

    var modal = document.createElement('div');
    modal.id = 'po-img-modal';
    var curSrc = el.src || '';
    modal.innerHTML =
        '<div id="po-img-backdrop"></div>' +
        '<div id="po-img-card">' +
            '<h3>Edit Image</h3>' +
            '<img id="po-img-preview" src="' + curSrc + '" onerror="this.style.opacity=0.2">' +
            '<div class="po-img-row"><div class="po-img-lbl">Image URL or path</div>' +
            '<input class="po-img-inp" id="po-img-src" type="text" value="' + curSrc + '" placeholder="https://... or filename.png"></div>' +
            '<div class="po-img-row"><div class="po-img-lbl">Alt Text</div>' +
            '<input class="po-img-inp" id="po-img-alt" type="text" value="' + (el.alt||'') + '" placeholder="description"></div>' +
            '<div class="po-img-row"><div class="po-img-lbl">Width</div>' +
            '<input class="po-img-inp" id="po-img-w" type="text" value="' + (el.style.width||el.getAttribute("width")||'') + '" placeholder="e.g. 100px or 50%"></div>' +
            '<div class="po-img-btns">' +
                '<button class="po-img-btn secondary" id="po-img-cancel">Cancel</button>' +
                '<button class="po-img-btn primary" id="po-img-apply">Apply</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);

    // Live preview
    document.getElementById('po-img-src').addEventListener('input', function() {
        document.getElementById('po-img-preview').src = this.value;
    });

    document.getElementById('po-img-apply').addEventListener('click', function() {
        var src = document.getElementById('po-img-src').value;
        var alt = document.getElementById('po-img-alt').value;
        var w   = document.getElementById('po-img-w').value;
        el.src = src;
        el.alt = alt;
        if (w) el.style.width = w;
        var sel = getEl(el);
        if (sel) {
            editChanges[sel] = editChanges[sel] || {};
            editChanges[sel].imgSrc = src;
            editChanges[sel].imgAlt = alt;
            if (w) editChanges[sel].imgWidth = w;
        }
        modal.parentNode.removeChild(modal);
        showPageNotif({ desc: 'image updated!' });
    });
    document.getElementById('po-img-cancel').addEventListener('click', function() {
        modal.parentNode.removeChild(modal);
    });
    document.getElementById('po-img-backdrop').addEventListener('click', function() {
        modal.parentNode.removeChild(modal);
    });
}

// ---- CUSTOM CODE MODAL ----
function openCodeModal(el) {
    var existing = document.getElementById('po-code-modal');
    if (existing) existing.parentNode.removeChild(existing);

    var modal = document.createElement('div');
    modal.id = 'po-code-modal';
    modal.innerHTML =
        '<div id="po-code-backdrop"></div>' +
        '<div id="po-code-card">' +
            '<div id="po-code-warn">are you sure you wanna do this? u don\'t wanna do ts if ur not a dev</div>' +
            '<textarea id="po-code-area" placeholder="// write JS here - runs on the selected element as `el`\n// e.g. el.style.background = \'red\'"></textarea>' +
            '<div class="po-img-btns">' +
                '<button class="po-img-btn secondary" id="po-code-cancel">nah nevermind</button>' +
                '<button class="po-img-btn primary" id="po-code-run">run it</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);

    document.getElementById('po-code-run').addEventListener('click', function() {
        var code = document.getElementById('po-code-area').value;
        try {
            var fn = new Function('el', code);
            fn(el);
            showPageNotif({ desc: 'code ran!' });
            modal.parentNode.removeChild(modal);
        } catch(err) {
            showPageNotif({ desc: 'error: ' + err.message, isError: true });
        }
    });
    document.getElementById('po-code-cancel').addEventListener('click', function() { modal.parentNode.removeChild(modal); });
    document.getElementById('po-code-backdrop').addEventListener('click', function() { modal.parentNode.removeChild(modal); });
}

// ---- INLINE TEXT EDIT (from context menu) ----
function ctxEditText(el) {
    document.querySelectorAll('.po-ea').forEach(function(a) {
        a.classList.remove('po-ea'); a.removeAttribute('contenteditable'); a.blur();
    });
    el.classList.add('po-ea');
    el.setAttribute('contenteditable', 'true');
    el.focus();
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.addEventListener('blur', function onB() {
        el.removeAttribute('contenteditable');
        el.classList.remove('po-ea');
        var s = getEl(el);
        if (s) { editChanges[s] = editChanges[s] || {}; editChanges[s].text = el.innerText; }
        el.removeEventListener('blur', onB);
    }, { once: true });
}

// ---- DRAG FROM CONTEXT MENU ----
function ctxStartDrag(el) {
    var r = el.getBoundingClientRect();
    el.style.position = 'fixed';
    el.style.zIndex   = '2147483640';
    el.style.left     = r.left + 'px';
    el.style.top      = r.top  + 'px';
    el.style.margin   = '0';
    showPageNotif({ desc: 'drag the element now!' });

    var startX = r.left, startY = r.top;
    var origX = 0, origY = 0;
    var dragging = false;

    function onDown(e) {
        if (e.target !== el) return;
        dragging = true;
        origX = e.clientX - parseFloat(el.style.left);
        origY = e.clientY - parseFloat(el.style.top);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }
    function onMove(e) {
        if (!dragging) return;
        el.style.left = (e.clientX - origX) + 'px';
        el.style.top  = (e.clientY - origY) + 'px';
    }
    function onUp() {
        dragging = false;
        var sel = getEl(el);
        if (sel) { editChanges[sel] = editChanges[sel] || {}; editChanges[sel].x = el.style.left; editChanges[sel].y = el.style.top; editChanges[sel].fixed = true; }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        el.removeEventListener('mousedown', onDown);
    }
    el.addEventListener('mousedown', onDown);
}

// ---- DOM EXPLORER PANEL ----
function showExplorer() {
    var panel = document.getElementById('po-explorer');
    if (!panel) buildExplorer();
    panel = document.getElementById('po-explorer');
    if (panel) {
        panel.classList.remove('collapsed');
        document.body.style.paddingLeft = '260px';
        var btn = document.getElementById('peb-explorer');
        if (btn) btn.textContent = 'Close Explorer';
    }
}

function hideExplorer() {
    var panel = document.getElementById('po-explorer');
    if (panel) {
        panel.classList.add('collapsed');
        document.body.style.paddingLeft = '';
        var btn = document.getElementById('peb-explorer');
        if (btn) btn.textContent = 'Open Explorer';
    }
}

function toggleExplorer() {
    var panel = document.getElementById('po-explorer');
    if (!panel) {
        buildExplorer();
        showExplorer();
    } else if (panel.classList.contains('collapsed')) {
        showExplorer();
    } else {
        hideExplorer();
    }
}

function buildExplorer() {
    if (document.getElementById('po-explorer')) return;
    var panel = document.createElement('div');
    panel.id = 'po-explorer';

    var toggle = document.createElement('button');
    toggle.id = 'po-exp-toggle';
    toggle.innerHTML = '&#9654;';
    toggle.title = 'Toggle Explorer';
    toggle.addEventListener('click', function() {
        toggleExplorer();
    });

    panel.innerHTML =
        '<div id="po-exp-hdr">Page Explorer</div>' +
        '<div id="po-exp-tree"></div>' +
        '<div id="po-exp-props"></div>';

    panel.appendChild(toggle);
    document.body.appendChild(panel);

    renderTree(document.body, document.getElementById('po-exp-tree'), 0);
}

function renderTree(root, container, depth) {
    var skipTags = ['SCRIPT','STYLE','META','LINK','HEAD'];
    var children = Array.from(root.children).filter(function(c) {
        return skipTags.indexOf(c.tagName) === -1 &&
               c.id !== 'po-explorer' && c.id !== 'po-edit-bar' &&
               c.id !== 'po-float' && c.id !== 'po-notif-root' &&
               c.id !== 'po-ctx' && c.id !== 'po-img-modal' && c.id !== 'po-code-modal' &&
               !c.id.startsWith('po-');
    });

    children.forEach(function(el) {
        var hasChildren = el.children.length > 0;
        var tag = el.tagName.toLowerCase();
        var cls = (typeof el.className === 'string' && el.className.trim())
            ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.')
            : '';
        var txt = el.childNodes.length > 0
            ? Array.from(el.childNodes).find(function(n){ return n.nodeType === 3 && n.textContent.trim(); })
            : null;
        var preview = txt ? txt.textContent.trim().slice(0,20) : '';

        var wrapper = document.createElement('div');

        var node = document.createElement('div');
        node.className = 'po-exp-node';
        node.style.paddingLeft = (8 + depth * 14) + 'px';
        node.innerHTML =
            (hasChildren ? '<span class="po-exp-arrow">&#9654;</span>' : '<span class="po-exp-arrow" style="opacity:0">&#9654;</span>') +
            '<span class="po-exp-tag">' + tag + '</span>' +
            (cls ? '<span class="po-exp-cls">' + cls + '</span>' : '') +
            (preview ? '<span class="po-exp-txt">"' + preview + '"</span>' : '');

        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'po-exp-children';
        var childrenBuilt = false;

        node.addEventListener('click', function(e) {
            e.stopPropagation();
            // Select element
            document.querySelectorAll('.po-exp-node.selected').forEach(function(n) { n.classList.remove('selected'); });
            node.classList.add('selected');
            selectedEl = el;
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            showElProps(el);

            // Highlight
            document.querySelectorAll('.po-highlight').forEach(function(h) { h.classList.remove('po-highlight'); });
            el.classList.add('po-highlight');

            // Toggle children
            if (hasChildren) {
                var arrow = node.querySelector('.po-exp-arrow');
                if (childrenDiv.classList.contains('open')) {
                    childrenDiv.classList.remove('open');
                    arrow.classList.remove('open');
                } else {
                    if (!childrenBuilt) {
                        renderTree(el, childrenDiv, depth + 1);
                        childrenBuilt = true;
                    }
                    childrenDiv.classList.add('open');
                    arrow.classList.add('open');
                }
            }
        });

        wrapper.appendChild(node);
        wrapper.appendChild(childrenDiv);
        container.appendChild(wrapper);
    });
}

function selectInExplorer(el) {
    // Collapse explorer if it is
    var panel = document.getElementById('po-explorer');
    if (panel) {
        panel.classList.remove('collapsed');
        var toggle = document.getElementById('po-exp-toggle');
        if (toggle) toggle.innerHTML = '&#9664;';
    }
    selectedEl = el;
    showElProps(el);
    el.classList.add('po-highlight');
}

function showElProps(el) {
    var props = document.getElementById('po-exp-props');
    if (!props) return;

    var cs = window.getComputedStyle(el);
    var fields = [
        { key: 'color',      val: el.style.color      || cs.color },
        { key: 'bg',         val: el.style.background || cs.backgroundColor },
        { key: 'font-size',  val: el.style.fontSize   || cs.fontSize },
        { key: 'opacity',    val: el.style.opacity     || cs.opacity },
        { key: 'display',    val: el.style.display     || cs.display },
        { key: 'width',      val: el.style.width       || cs.width },
        { key: 'height',     val: el.style.height      || cs.height },
        { key: 'padding',    val: el.style.padding     || cs.padding },
        { key: 'margin',     val: el.style.margin      || cs.margin },
        { key: 'border-r',   val: el.style.borderRadius|| cs.borderRadius },
    ];

    props.innerHTML = fields.map(function(f) {
        return '<div class="po-prop-row">' +
            '<span class="po-prop-key">' + f.key + '</span>' +
            '<input class="po-prop-val" data-prop="' + f.key + '" value="' + (f.val||'').replace(/"/g,'') + '">' +
            '<button class="po-prop-apply" data-prop="' + f.key + '">OK</button>' +
        '</div>';
    }).join('');

    var propMap = { color:'color', bg:'background', 'font-size':'fontSize', opacity:'opacity', display:'display', width:'width', height:'height', padding:'padding', margin:'margin', 'border-r':'borderRadius' };
    props.querySelectorAll('.po-prop-apply').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var key = btn.getAttribute('data-prop');
            var val = props.querySelector('input[data-prop="' + key + '"]').value;
            var cssProp = propMap[key];
            if (cssProp) {
                el.style[cssProp] = val;
                var sel = getEl(el);
                if (sel) {
                    editChanges[sel] = editChanges[sel] || {};
                    editChanges[sel].styles = editChanges[sel].styles || {};
                    editChanges[sel].styles[cssProp] = val;
                }
            }
        });
    });

    // Also handle enter key
    props.querySelectorAll('.po-prop-val').forEach(function(inp) {
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                props.querySelector('.po-prop-apply[data-prop="' + inp.getAttribute('data-prop') + '"]').click();
            }
        });
    });
}

// ---- MAIN EDITOR INIT ----
function startEditor() {
    injectStyles();
    injectEditorStyles();
    if (!document.body) { document.addEventListener('DOMContentLoaded', startEditor); return; }
    if (editActive) return;
    editActive = true;

    chrome.storage.local.get(STORE_KEY, function(d) {
        try { editChanges = JSON.parse(d[STORE_KEY] || '{}'); } catch(e) { editChanges = {}; }
    });

    // Top bar
    var bar = document.createElement('div');
    bar.id = 'po-edit-bar';
    bar.innerHTML =
        '<div id="po-edit-badge"><div id="po-edit-dot"></div><span id="po-edit-label">Edit Mode</span></div>' +
        '<span id="po-edit-hint">right-click any element  |  use explorer panel left</span>' +
        '<button class="peb" id="peb-save">Save Changes</button>' +
        '<button class="peb" id="peb-reset">Reset</button>' +
        '<button class="peb" id="peb-explorer">Open Explorer</button>' +
        '<button class="peb" id="peb-cancel">Cancel Editing</button>';
    document.body.appendChild(bar);
    document.body.style.paddingTop  = '50px';

    // Right-click on page elements
    document.addEventListener('contextmenu', edContextMenu, true);
    // Hover highlight
    document.addEventListener('mouseover', edHover);
    document.addEventListener('mouseout',  edHout);

    document.getElementById('peb-save').addEventListener('click', edSave);
    document.getElementById('peb-reset').addEventListener('click', edReset);
    document.getElementById('peb-cancel').addEventListener('click', edStop);
    document.getElementById('peb-explorer').addEventListener('click', toggleExplorer);
}

function edStop() {
    editActive = false;
    closeCtxMenu();
    var bar = document.getElementById('po-explorer');
    if (bar) bar.parentNode.removeChild(bar);
    var editBar = document.getElementById('po-edit-bar');
    if (editBar) editBar.parentNode.removeChild(editBar);
    var imgModal = document.getElementById('po-img-modal');
    if (imgModal) imgModal.parentNode.removeChild(imgModal);
    var codeModal = document.getElementById('po-code-modal');
    if (codeModal) codeModal.parentNode.removeChild(codeModal);
    document.body.style.paddingTop  = '';
    document.removeEventListener('contextmenu', edContextMenu, true);
    document.removeEventListener('mouseover', edHover);
    document.removeEventListener('mouseout',  edHout);
    document.querySelectorAll('.po-ea,.po-eh,.po-highlight').forEach(function(el) {
        el.classList.remove('po-ea','po-eh','po-highlight');
        el.removeAttribute('contenteditable');
    });
}

function edContextMenu(e) {
    if (!editActive) return;
    if (inEditUI(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    showCtxMenu(e.clientX, e.clientY, e.target);
}

function edHover(e) {
    if (!editActive || inEditUI(e.target)) return;
    e.target.classList.add('po-highlight');
}
function edHout(e) {
    if (!editActive) return;
    e.target.classList.remove('po-highlight');
}

// ---- APPLY SAVED LAYOUT ----
function applyLayout(ch) {
    Object.keys(ch).forEach(function(sel) {
        try {
            // Skip our own injected overlay elements
            if (sel.indexOf('po-veil-el-') !== -1) return;
            var el = document.querySelector(sel);
            if (!el) return;
            var c = ch[sel];
            // Use setAttribute so MutationObserver swap doesn't clobber it
            if (c.text !== undefined) {
                el.setAttribute('data-veil-text', c.text);
                el.innerText = c.text;
            }
            if (c.hidden)  el.style.setProperty('visibility', 'hidden', 'important');
            if (c.imgSrc)  el.src = c.imgSrc;
            if (c.imgAlt)  el.alt = c.imgAlt;
            if (c.imgWidth) el.style.width = c.imgWidth;
            if (c.styles) { Object.keys(c.styles).forEach(function(p) { el.style[p] = c.styles[p]; }); }
            if (c.fixed) {
                el.style.position = 'fixed';
                el.style.zIndex   = '2147483640';
                el.style.margin   = '0';
                if (c.x) el.style.left = c.x;
                if (c.y) el.style.top  = c.y;
            }
        } catch(e) {}
    });
    // Restore custom overlay elements
    restoreVeilElements();
}

function edSave() {
    // Also persist overlay elements
    var overlayEls = [];
    document.querySelectorAll('[data-veil-overlay]').forEach(function(el) {
        overlayEls.push({
            type:    el.getAttribute('data-veil-type'),
            content: el.getAttribute('data-veil-content') || el.innerText,
            x:       el.style.left,
            y:       el.style.top,
            style:   el.getAttribute('style') || '',
        });
    });
    editChanges['__veil_overlays__'] = overlayEls;
    var store = {}; store[STORE_KEY] = JSON.stringify(editChanges);
    chrome.storage.local.set(store, function() { showPageNotif({ desc: 'layout saved!' }); });
}
function edReset() {
    editChanges = {}; var store = {}; store[STORE_KEY] = '{}';
    chrome.storage.local.set(store, function() { showPageNotif({ desc: 'layout reset!' }); });
}

chrome.storage.local.get(STORE_KEY, function(d) {
    try {
        var ch = JSON.parse(d[STORE_KEY] || '{}');
        if (Object.keys(ch).length > 0) {
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function() { setTimeout(function() { applyLayout(ch); }, 600); });
            else setTimeout(function() { applyLayout(ch); }, 600);
        }
    } catch(e) {}
});


// =========================================================================
// -- HOTKEY SYSTEM --------------------------------------------------------
// =========================================================================
var HOTKEYS = {
    // Alt + key combos
    's': function() { if (CONFIG.isStreamModeEnabled !== undefined) { CONFIG.isStreamModeEnabled = !CONFIG.isStreamModeEnabled; chrome.storage.local.set({ isStreamModeEnabled: CONFIG.isStreamModeEnabled }); showPageNotif({ desc: 'stream mode ' + (CONFIG.isStreamModeEnabled ? 'on' : 'off') }); } },
    'p': function() { buildPopoutWidget(); showPageNotif({ desc: 'popout opened' }); },
    'e': function() { if (!editActive) startEditor(); else edStop(); },
    'h': function() {
        var f = document.getElementById('po-float');
        if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
    },
};

document.addEventListener('keydown', function(e) {
    if (!e.altKey) return;
    if (['INPUT','TEXTAREA'].indexOf(e.target.tagName) !== -1) return;
    if (e.target.getAttribute && e.target.getAttribute('contenteditable')) return;
    var k = e.key.toLowerCase();
    if (HOTKEYS[k]) {
        e.preventDefault();
        HOTKEYS[k]();
    }
});

// =========================================================================
// -- CUSTOM OVERLAY ELEMENTS SYSTEM ---------------------------------------
// =========================================================================

var VEIL_ELEMENTS = [
    // TEXT ELEMENTS
    { cat: 'Text',   id: 'live-badge',    label: 'LIVE Badge',         html: '<div style="background:linear-gradient(135deg,#ff375f,#bf5af2);color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:1px;font-family:-apple-system,sans-serif;box-shadow:0 0 16px rgba(255,55,95,0.6)">LIVE</div>' },
    { cat: 'Text',   id: 'not-financial', label: 'Not Financial Advice', html: '<div style="background:rgba(0,0,0,0.7);color:rgba(255,255,255,0.6);padding:5px 12px;border-radius:8px;font-size:10px;font-family:-apple-system,sans-serif;border:1px solid rgba(255,255,255,0.1)">Not financial advice</div>' },
    { cat: 'Text',   id: 'custom-label',  label: 'Custom Text Label',  html: '<div style="color:#fff;font-size:14px;font-weight:600;font-family:-apple-system,sans-serif;text-shadow:0 2px 8px rgba(0,0,0,0.8)" contenteditable="true">Your text here</div>' },
    { cat: 'Text',   id: 'profit-display',label: 'Profit Display',     html: '<div style="background:rgba(36,177,91,0.15);border:1px solid rgba(36,177,91,0.4);border-radius:12px;padding:8px 16px;color:#24b15b;font-size:18px;font-weight:800;font-family:-apple-system,sans-serif">+$0.00</div>' },
    { cat: 'Text',   id: 'loss-display',  label: 'Loss Display',       html: '<div style="background:rgba(255,69,58,0.15);border:1px solid rgba(255,69,58,0.4);border-radius:12px;padding:8px 16px;color:#ff453a;font-size:18px;font-weight:800;font-family:-apple-system,sans-serif">-$0.00</div>' },
    { cat: 'Text',   id: 'win-rate',      label: 'Win Rate Badge',     html: '<div style="background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:8px 14px;font-family:-apple-system,sans-serif;color:#fff"><div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px">Win Rate</div><div style="font-size:20px;font-weight:800;color:#24b15b">0%</div></div>' },
    { cat: 'Text',   id: 'streak',        label: 'Streak Counter',     html: '<div style="background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border:1px solid rgba(255,193,7,0.3);border-radius:12px;padding:8px 14px;font-family:-apple-system,sans-serif"><div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px">Streak</div><div style="font-size:20px;font-weight:800;color:#ffd60a">0x</div></div>' },
    { cat: 'Text',   id: 'trades-today',  label: 'Trades Today',       html: '<div style="background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border:1px solid rgba(0,176,255,0.3);border-radius:12px;padding:8px 14px;font-family:-apple-system,sans-serif"><div style="font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px">Trades Today</div><div style="font-size:20px;font-weight:800;color:#00b0ff">0</div></div>' },
    { cat: 'Text',   id: 'disclaimer',    label: 'Risk Disclaimer',    html: '<div style="background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.4);padding:4px 10px;border-radius:6px;font-size:9px;font-family:-apple-system,sans-serif;max-width:280px;text-align:center">Trading involves risk. Past performance does not guarantee future results.</div>' },
    { cat: 'Text',   id: 'channel-name',  label: 'Channel Name',       html: '<div style="background:linear-gradient(135deg,#bf5af2,#ff375f);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:22px;font-weight:900;font-family:-apple-system,sans-serif;letter-spacing:-0.5px" contenteditable="true">YourChannel</div>' },

    // BADGE / STATUS
    { cat: 'Badge',  id: 'verified-badge',label: 'Verified Badge',     html: '<div style="display:flex;align-items:center;gap:6px;background:rgba(36,177,91,0.12);border:1px solid rgba(36,177,91,0.3);border-radius:20px;padding:4px 12px;font-family:-apple-system,sans-serif"><div style="width:6px;height:6px;border-radius:50%;background:#24b15b;box-shadow:0 0 8px rgba(36,177,91,0.8)"></div><span style="font-size:11px;font-weight:600;color:#24b15b">Verified</span></div>' },
    { cat: 'Badge',  id: 'demo-badge',    label: 'Demo Mode Badge',    html: '<div style="background:rgba(255,193,7,0.12);border:1px solid rgba(255,193,7,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#ffd60a;font-family:-apple-system,sans-serif;letter-spacing:0.5px">DEMO</div>' },
    { cat: 'Badge',  id: 'real-badge',    label: 'Real Mode Badge',    html: '<div style="background:rgba(191,90,242,0.12);border:1px solid rgba(191,90,242,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#bf5af2;font-family:-apple-system,sans-serif;letter-spacing:0.5px">REAL</div>' },
    { cat: 'Badge',  id: 'pro-badge',     label: 'PRO Badge',          html: '<div style="background:linear-gradient(135deg,#bf5af2,#ff375f);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:800;color:#fff;font-family:-apple-system,sans-serif;letter-spacing:1px;box-shadow:0 4px 12px rgba(191,90,242,0.35)">PRO</div>' },
    { cat: 'Badge',  id: 'sponsored',     label: 'Sponsored Tag',      html: '<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:3px 8px;font-size:9px;font-weight:600;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:0.8px">Sponsored</div>' },

    // SHAPES / DIVIDERS
    { cat: 'Shape',  id: 'divider-h',     label: 'Horizontal Divider', html: '<div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(191,90,242,0.6),transparent)"></div>' },
    { cat: 'Shape',  id: 'divider-v',     label: 'Vertical Divider',   html: '<div style="width:1px;height:80px;background:linear-gradient(180deg,transparent,rgba(191,90,242,0.6),transparent)"></div>' },
    { cat: 'Shape',  id: 'glow-dot',      label: 'Glow Dot',           html: '<div style="width:10px;height:10px;border-radius:50%;background:#bf5af2;box-shadow:0 0 0 4px rgba(191,90,242,0.2),0 0 20px rgba(191,90,242,0.6)"></div>' },
    { cat: 'Shape',  id: 'corner-accent', label: 'Corner Accent',      html: '<div style="width:40px;height:40px;border-top:2px solid #bf5af2;border-left:2px solid #bf5af2;border-radius:4px 0 0 0;opacity:0.7"></div>' },
    { cat: 'Shape',  id: 'glass-box',     label: 'Glass Box',          html: '<div style="width:120px;height:60px;background:rgba(255,255,255,0.04);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:12px"></div>' },

    // OVERLAYS / PANELS
    { cat: 'Panel',  id: 'stats-panel',   label: 'Stats Panel',        html: '<div style="background:rgba(10,10,16,0.85);backdrop-filter:blur(16px);border:1px solid rgba(191,90,242,0.18);border-radius:14px;padding:12px 16px;font-family:-apple-system,sans-serif;min-width:160px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:rgba(191,90,242,0.8);margin-bottom:8px">Session Stats</div><div style="display:flex;flex-direction:column;gap:5px"><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.6)"><span>Win Rate</span><span style="color:#24b15b;font-weight:600">0%</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.6)"><span>Trades</span><span style="color:#fff;font-weight:600">0</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.6)"><span>P&L</span><span style="color:#24b15b;font-weight:600">$0.00</span></div></div></div>' },
    { cat: 'Panel',  id: 'timer-panel',   label: 'Session Timer',      html: '<div style="background:rgba(10,10,16,0.85);backdrop-filter:blur(16px);border:1px solid rgba(0,176,255,0.2);border-radius:12px;padding:10px 16px;font-family:-apple-system,sans-serif;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px">Session</div><div style="font-size:22px;font-weight:800;color:#00b0ff;letter-spacing:2px;font-variant-numeric:tabular-nums">00:00</div></div>' },
    { cat: 'Panel',  id: 'alert-box',     label: 'Alert Box',          html: '<div style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.3);border-radius:10px;padding:8px 14px;font-family:-apple-system,sans-serif;max-width:200px"><div style="font-size:10px;font-weight:700;color:#ff453a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px">Alert</div><div style="font-size:11px;color:rgba(255,255,255,0.7)" contenteditable="true">Your alert message here</div></div>' },
    { cat: 'Panel',  id: 'note-box',      label: 'Sticky Note',        html: '<div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.25);border-radius:10px;padding:10px 14px;font-family:-apple-system,sans-serif;max-width:180px"><div style="font-size:9px;font-weight:700;color:#ffd60a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Note</div><div style="font-size:11px;color:rgba(255,255,255,0.75);line-height:1.5" contenteditable="true">Your note here...</div></div>' },
    { cat: 'Panel',  id: 'social-links',  label: 'Social Links Bar',   html: '<div style="display:flex;gap:8px;align-items:center;background:rgba(10,10,16,0.8);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 12px;font-family:-apple-system,sans-serif"><span style="font-size:11px;color:rgba(255,255,255,0.5)">Follow:</span><span style="font-size:11px;font-weight:600;color:#00b0ff" contenteditable="true">@yourname</span></div>' },

    // STREAM SPECIFIC
    { cat: 'Stream', id: 'stream-badge',  label: 'Stream Live Badge',  html: '<div style="display:flex;align-items:center;gap:8px;background:rgba(10,10,16,0.9);backdrop-filter:blur(10px);border:1px solid rgba(255,55,95,0.3);border-radius:20px;padding:6px 14px;font-family:-apple-system,sans-serif"><div style="width:7px;height:7px;border-radius:50%;background:#ff375f;box-shadow:0 0 8px rgba(255,55,95,0.9);animation:po-drain 0s"></div><span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:0.5px">LIVE</span><span style="font-size:10px;color:rgba(255,255,255,0.4)" contenteditable="true">0 viewers</span></div>' },
    { cat: 'Stream', id: 'no-spoilers',   label: 'No Spoilers Bar',    html: '<div style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);padding:6px 16px;font-family:-apple-system,sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.3px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">Stream - No Spoilers Please</div>' },
    { cat: 'Stream', id: 'hype-train',    label: 'Hype Bar',           html: '<div style="background:rgba(10,10,16,0.85);backdrop-filter:blur(10px);border:1px solid rgba(191,90,242,0.2);border-radius:10px;padding:8px 14px;font-family:-apple-system,sans-serif;width:200px"><div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,0.4);margin-bottom:5px"><span style="text-transform:uppercase;letter-spacing:0.5px">Hype</span><span contenteditable="true">0%</span></div><div style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden"><div style="height:100%;width:0%;background:linear-gradient(90deg,#bf5af2,#ff375f);border-radius:4px;transition:width 0.5s ease"></div></div></div>' },
    { cat: 'Stream', id: 'goal-tracker',  label: 'Goal Tracker',       html: '<div style="background:rgba(10,10,16,0.85);backdrop-filter:blur(10px);border:1px solid rgba(36,177,91,0.2);border-radius:10px;padding:8px 14px;font-family:-apple-system,sans-serif;width:200px"><div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,0.4);margin-bottom:5px"><span style="text-transform:uppercase;letter-spacing:0.5px" contenteditable="true">Daily Goal</span><span contenteditable="true">$0 / $100</span></div><div style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden"><div style="height:100%;width:0%;background:linear-gradient(90deg,#24b15b,#00b0ff);border-radius:4px"></div></div></div>' },
];

// ---- CUSTOM ELEMENTS CSS ----
function injectVeilElementsCSS() {
    if (document.getElementById('po-vel-styles')) return;
    var s = document.createElement('style');
    s.id = 'po-vel-styles';
    s.textContent = [
        '#po-vel-panel{position:fixed !important;top:50px !important;right:0 !important;width:240px !important;bottom:0 !important;background:rgba(8,8,14,0.97) !important;border-left:1px solid rgba(191,90,242,0.18) !important;z-index:2147483644 !important;font-family:-apple-system,BlinkMacSystemFont,sans-serif !important;display:flex !important;flex-direction:column !important;transition:transform 0.3s cubic-bezier(0.22,1,0.36,1) !important;}',
        '#po-vel-panel.closed{transform:translateX(240px) !important;}',
        '#po-vel-hdr{padding:10px 12px 8px !important;border-bottom:1px solid rgba(191,90,242,0.12) !important;font-size:9px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:0.8px !important;background:linear-gradient(90deg,#bf5af2,#ff375f) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;flex-shrink:0 !important;}',
        '#po-vel-search{margin:6px 8px !important;padding:6px 10px !important;font-size:11px !important;font-family:inherit !important;background:rgba(255,255,255,0.04) !important;border:1px solid rgba(255,255,255,0.08) !important;color:#fff !important;border-radius:8px !important;outline:none !important;width:calc(100% - 16px) !important;box-sizing:border-box !important;}',
        '#po-vel-search:focus{border-color:rgba(191,90,242,0.4) !important;}',
        '#po-vel-cats{display:flex !important;gap:4px !important;padding:0 8px 6px !important;flex-wrap:wrap !important;flex-shrink:0 !important;}',
        '.po-vel-cat{padding:2px 8px !important;border-radius:10px !important;font-size:9px !important;font-weight:600 !important;cursor:pointer !important;border:1px solid rgba(255,255,255,0.1) !important;color:rgba(255,255,255,0.45) !important;transition:all 0.15s !important;background:transparent !important;font-family:inherit !important;box-shadow:none !important;transform:none !important;}',
        '.po-vel-cat:hover,.po-vel-cat.active{background:rgba(191,90,242,0.15) !important;border-color:rgba(191,90,242,0.4) !important;color:#bf5af2 !important;transform:none !important;box-shadow:none !important;}',
        '#po-vel-list{flex:1 !important;overflow-y:auto !important;padding:4px 8px 8px !important;}',
        '#po-vel-list::-webkit-scrollbar{width:3px !important;}',
        '#po-vel-list::-webkit-scrollbar-thumb{background:rgba(191,90,242,0.3) !important;border-radius:3px !important;}',
        '.po-vel-item{padding:7px 10px !important;border-radius:9px !important;border:1px solid rgba(255,255,255,0.06) !important;margin-bottom:4px !important;cursor:pointer !important;transition:all 0.15s !important;background:rgba(255,255,255,0.02) !important;}',
        '.po-vel-item:hover{background:rgba(191,90,242,0.1) !important;border-color:rgba(191,90,242,0.3) !important;}',
        '.po-vel-item-cat{font-size:8.5px !important;font-weight:600 !important;text-transform:uppercase !important;letter-spacing:0.5px !important;color:rgba(191,90,242,0.6) !important;margin-bottom:2px !important;}',
        '.po-vel-item-label{font-size:11.5px !important;font-weight:500 !important;color:rgba(255,255,255,0.8) !important;}',
        '[data-veil-overlay]{cursor:move !important;user-select:none !important;}',
        '[data-veil-overlay]:hover{outline:1px dashed rgba(191,90,242,0.5) !important;outline-offset:2px !important;}',
        '[data-veil-overlay] [contenteditable]{cursor:text !important;outline:none !important;}',
        '#po-vel-toggle{position:absolute !important;left:-22px !important;top:50% !important;transform:translateY(-50%) !important;width:22px !important;height:44px !important;background:rgba(8,8,14,0.97) !important;border:1px solid rgba(191,90,242,0.18) !important;border-right:none !important;border-radius:8px 0 0 8px !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;color:rgba(191,90,242,0.7) !important;font-size:10px !important;padding:0 !important;margin:0 !important;box-shadow:none !important;transition:background 0.2s !important;}',
        '#po-vel-toggle:hover{background:rgba(191,90,242,0.12) !important;color:#bf5af2 !important;transform:translateY(-50%) !important;box-shadow:none !important;}',
    ].join('');
    document.documentElement.appendChild(s);
}

// ---- RESTORE OVERLAY ELEMENTS FROM SAVED DATA ----
function restoreVeilElements() {
    chrome.storage.local.get(STORE_KEY, function(d) {
        try {
            var ch = JSON.parse(d[STORE_KEY] || '{}');
            var overlays = ch['__veil_overlays__'];
            if (!overlays || !overlays.length) return;
            overlays.forEach(function(data) {
                // Don't re-add if already on page
                var existing = document.querySelector('[data-veil-type="' + data.type + '"][data-veil-restored]');
                if (existing) return;
                var def = VEIL_ELEMENTS.find(function(e) { return e.id === data.type; });
                if (!def) return;
                spawnVeilElement(def, data.x, data.y, true);
            });
        } catch(e) {}
    });
}

// ---- SPAWN ELEMENT ONTO PAGE ----
function spawnVeilElement(def, x, y, restored) {
    injectVeilElementsCSS();
    var wrap = document.createElement('div');
    wrap.setAttribute('data-veil-overlay', '1');
    wrap.setAttribute('data-veil-type', def.id);
    if (restored) wrap.setAttribute('data-veil-restored', '1');
    wrap.innerHTML = def.html;
    wrap.style.cssText = 'position:fixed !important;z-index:2147483641 !important;left:' + (x || '100px') + ';top:' + (y || '100px') + ';';

    // Delete on double-click
    wrap.addEventListener('dblclick', function(e) {
        if (e.target.getAttribute && e.target.getAttribute('contenteditable')) return;
        wrap.parentNode.removeChild(wrap);
    });

    // Drag to reposition
    wrap.addEventListener('mousedown', function(e) {
        if (e.target.getAttribute && e.target.getAttribute('contenteditable')) return;
        e.preventDefault();
        var startX = e.clientX - wrap.offsetLeft;
        var startY = e.clientY - wrap.offsetTop;
        function onMove(ev) {
            wrap.style.left = (ev.clientX - startX) + 'px';
            wrap.style.top  = (ev.clientY - startY) + 'px';
        }
        function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    document.body.appendChild(wrap);
    return wrap;
}

// ---- ELEMENTS PANEL ----
function buildElementsPanel() {
    if (document.getElementById('po-vel-panel')) return;
    injectVeilElementsCSS();

    var panel = document.createElement('div');
    panel.id = 'po-vel-panel';
    panel.classList.add('closed');

    var toggle = document.createElement('button');
    toggle.id = 'po-vel-toggle';
    toggle.innerHTML = '&#9664;';
    toggle.title = 'Elements Panel';
    var open = false;
    toggle.addEventListener('click', function() {
        open = !open;
        if (open) { panel.classList.remove('closed'); toggle.innerHTML = '&#9654;'; }
        else       { panel.classList.add('closed');    toggle.innerHTML = '&#9664;'; }
    });

    var cats = ['All'].concat([...new Set(VEIL_ELEMENTS.map(function(e) { return e.cat; }))]);
    var activeCat = 'All';

    panel.innerHTML =
        '<div id="po-vel-hdr">Add Elements</div>' +
        '<input id="po-vel-search" placeholder="Search elements..." type="text">' +
        '<div id="po-vel-cats">' +
            cats.map(function(c) { return '<button class="po-vel-cat' + (c === 'All' ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>'; }).join('') +
        '</div>' +
        '<div id="po-vel-list"></div>';

    panel.appendChild(toggle);
    document.body.appendChild(panel);

    function renderList(filter, cat) {
        var list = document.getElementById('po-vel-list');
        var items = VEIL_ELEMENTS.filter(function(e) {
            var matchCat   = cat === 'All' || e.cat === cat;
            var matchFilter = !filter || e.label.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
            return matchCat && matchFilter;
        });
        list.innerHTML = items.map(function(e) {
            return '<div class="po-vel-item" data-id="' + e.id + '">' +
                '<div class="po-vel-item-cat">' + e.cat + '</div>' +
                '<div class="po-vel-item-label">' + e.label + '</div>' +
            '</div>';
        }).join('');
        list.querySelectorAll('.po-vel-item').forEach(function(node) {
            node.addEventListener('click', function() {
                var id = node.getAttribute('data-id');
                var def = VEIL_ELEMENTS.find(function(e) { return e.id === id; });
                if (def) {
                    spawnVeilElement(def, '120px', '120px', false);
                    showPageNotif({ desc: def.label + ' added! drag it anywhere. double-click to remove.' });
                }
            });
        });
    }

    renderList('', 'All');

    document.getElementById('po-vel-search').addEventListener('input', function() {
        renderList(this.value, activeCat);
    });
    panel.querySelectorAll('.po-vel-cat').forEach(function(btn) {
        btn.addEventListener('click', function() {
            panel.querySelectorAll('.po-vel-cat').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            activeCat = btn.getAttribute('data-cat');
            renderList(document.getElementById('po-vel-search').value, activeCat);
        });
    });
}

// ---- WIRE ELEMENTS PANEL INTO EDITOR ----
var _origStartEditor = startEditor;
startEditor = function() {
    _origStartEditor();
    buildElementsPanel();
    // Add "Add Elements" button to top bar
    var bar = document.getElementById('po-edit-bar');
    if (bar && !document.getElementById('peb-elements')) {
        var btn = document.createElement('button');
        btn.className = 'peb';
        btn.id = 'peb-elements';
        btn.textContent = 'Add Elements';
        btn.style.cssText = 'background:rgba(0,176,255,0.12) !important;border:1px solid rgba(0,176,255,0.3) !important;color:#00b0ff !important;';
        btn.addEventListener('click', function() {
            var panel = document.getElementById('po-vel-panel');
            if (panel) {
                var isOpen = !panel.classList.contains('closed');
                if (isOpen) { panel.classList.add('closed'); document.getElementById('po-vel-toggle').innerHTML = '&#9664;'; }
                else        { panel.classList.remove('closed'); document.getElementById('po-vel-toggle').innerHTML = '&#9654;'; }
            }
        });
        // Insert before Save Changes
        var saveBtn = document.getElementById('peb-save');
        bar.insertBefore(btn, saveBtn);
    }
};

var _origEdStop = edStop;
edStop = function() {
    _origEdStop();
    var velPanel = document.getElementById('po-vel-panel');
    if (velPanel) velPanel.parentNode.removeChild(velPanel);
};

// =========================================================================
// =========================================================================
// -- UPDATE NOTIFIER ------------------------------------------------------
// =========================================================================

var UPDATE_MESSAGES = ['a'];
// -------------------------------------------------------------------------

var VEIL_CURRENT_VERSION = '2.4.5';
var UPDATE_CHECK_URL = 'https://raw.githubusercontent.com/meatballsong1/po-extension/main/version.json?t=';


// The styled blue in-page update box (not a notif — a persistent banner)
function showUpdateBanner(currentVersion, latestVersion) {
    if (document.getElementById('po-update-banner')) return;

    injectStyles();

    var banner = document.createElement('div');
    banner.id = 'po-update-banner';
    banner.style.cssText = [
        'position:fixed !important',
        'bottom:20px !important',
        'left:50% !important',
        'transform:translateX(-50%) !important',
        'z-index:2147483647 !important',
        'background:rgba(8,24,40,0.97) !important',
        'border:1px solid rgba(0,176,255,0.35) !important',
        'border-radius:14px !important',
        'padding:13px 16px 13px 14px !important',
        'display:flex !important',
        'align-items:flex-start !important',
        'gap:10px !important',
        'box-shadow:0 8px 32px rgba(0,0,0,0.7),0 0 0 1px rgba(0,176,255,0.08),0 0 30px rgba(0,176,255,0.1) !important',
        'font-family:-apple-system,BlinkMacSystemFont,sans-serif !important',
        'max-width:340px !important',
        'min-width:280px !important',
        'backdrop-filter:blur(20px) !important',
        'animation:po-drain 0s !important',
    ].join(';');

    
    var dl = document.createElement('a');
    dl.href = 'https://github.com/meatballsong1/po-extension/archive/refs/heads/main.zip';
    dl.textContent = 'Download ZIP';
    dl.style.cssText = 'display:inline-block;padding:5px 12px;background:rgba(0,176,255,0.15);border:1px solid rgba(0,176,255,0.3);border-radius:8px;font-size:11px;font-weight:700;color:#00b0ff;text-decoration:none;margin-top:2px;';
    dl.addEventListener('mouseover', function() { this.style.background = 'rgba(0,176,255,0.28)'; });
    dl.addEventListener('mouseout',  function() { this.style.background = 'rgba(0,176,255,0.15)'; });

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'x';
    closeBtn.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:3px 6px;cursor:pointer;color:rgba(255,255,255,0.4);font-size:10px;flex-shrink:0;font-family:inherit;';
    closeBtn.addEventListener('click', function() { banner.parentNode && banner.parentNode.removeChild(banner); });
    closeBtn.addEventListener('mouseover', function() { this.style.background = 'rgba(255,255,255,0.12)'; this.style.color = '#fff'; });
    closeBtn.addEventListener('mouseout',  function() { this.style.background = 'rgba(255,255,255,0.06)'; this.style.color = 'rgba(255,255,255,0.4)'; });

    var icon = document.createElement('div');
    icon.style.cssText = 'width:32px;height:32px;border-radius:50%;background:rgba(0,176,255,0.12);border:1px solid rgba(0,176,255,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;';
    icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M4 7l3 3 3-3" stroke="#00b0ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12h10" stroke="#00b0ff" stroke-width="1.6" stroke-linecap="round"/></svg>';

    var label = document.createElement('div');
    label.style.cssText = 'font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#00b0ff;margin-bottom:4px;';
    label.textContent = 'update available';

    var msg = document.createElement('div');
    msg.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.85);font-weight:500;line-height:1.5;margin-bottom:6px;';
    msg.innerHTML = 'You’re on <b style="color:#fff;">v' + currentVersion + '</b> but there’s a newer version <b style="color:#00b0ff;">v' + latestVersion + '</b>. ' ;

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;min-width:0;';
    body.appendChild(label);
    body.appendChild(msg);
    body.appendChild(dl);

    banner.appendChild(icon);
    banner.appendChild(body);
    banner.appendChild(closeBtn);

    (document.body || document.documentElement).appendChild(banner);
}

function checkForUpdate() {
    fetch(UPDATE_CHECK_URL + Date.now())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data || !data.version) return;
            var latestVersion = data.version;
            chrome.storage.local.get('veil_last_seen_update', function(d) {
                if (chrome.runtime.lastError) return;
                var lastSeen = d['veil_last_seen_update'] || '';
                if (latestVersion !== VEIL_CURRENT_VERSION && latestVersion !== lastSeen) {
                    showUpdateBanner(VEIL_CURRENT_VERSION, latestVersion);
                    chrome.storage.local.set({ 'veil_last_seen_update': latestVersion });
                }
            });
        })
        .catch(function() {});
}

// Auto-check 5s after page load
if (window.location.href.indexOf('pocketoption.com') !== -1) {
    setTimeout(checkForUpdate, 5000);
}


// -- CHANGELOG ---------------------------------------------------------
// ============================================================
// EDIT THIS OBJECT TO CUSTOMIZE THE CHANGELOG POPUP
// ============================================================
var CHANGELOG = {
    version: '2.4.5',

    title: '',
    subtitle: '',

    image: '',

    // 'bullets' | 'text' | 'links' | 'none'
    mode: 'bullets',

    items: [
        'icons are FULLY fixed so you can effortlessly swap',
        'Stability and random crashes have been fixed',
        'Diddy has been added to improve stability',
        'FULL customization to your pocket option page so you can FAKE WHATEVER THE FUCK YOU WANT!',
        'New stream mode so you can hide certain aspects of pocket option like your balance',
        'An about tab that you probably dont give a shit about',
        'This new changelog popup obviously',
    ],

    text: '',

    // links mode example:
    //   items: [
    //     { text: 'View full changelog', url: 'https://github.com/you/repo' },
    //     { text: 'Join the Discord',    url: 'https://discord.gg/xyz' },
    //     'Or just a plain text row with no link',
    //   ]

    buttonLabel: 'Pretty tuff',
};
// ============================================================

var CL_KEY = 'po_seen_version';

function showChangelog() {
    injectStyles();
    if (!document.body) { document.addEventListener('DOMContentLoaded', showChangelog); return; }
    if (document.getElementById('po-cl-overlay')) return;

    var bodyHTML = '';
    if (CHANGELOG.mode === 'bullets' && CHANGELOG.items && CHANGELOG.items.length) {
        var lis = CHANGELOG.items.map(function(t) { return '<li>' + t + '</li>'; }).join('');
        bodyHTML = '<ul id="po-cl-list">' + lis + '</ul>';
    } else if (CHANGELOG.mode === 'text' && CHANGELOG.text) {
        bodyHTML = '<p id="po-cl-text">' + CHANGELOG.text + '</p>';
    } else if (CHANGELOG.mode === 'links' && CHANGELOG.items && CHANGELOG.items.length) {
        var rows = CHANGELOG.items.map(function(item) {
            if (typeof item === 'string') return '<li class="po-cl-link-row"><span class="po-cl-link-plain">' + item + '</span></li>';
            return '<li class="po-cl-link-row"><a class="po-cl-link" href="' + item.url + '" target="_blank" rel="noopener"><span class="po-cl-link-text">' + item.text + '</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a></li>';
        }).join('');
        bodyHTML = '<ul id="po-cl-links">' + rows + '</ul>';
    }

    var imgHTML = '';
    if (CHANGELOG.image) {
        var src = (CHANGELOG.image.indexOf('http') === 0 || CHANGELOG.image.indexOf('//') === 0)
            ? CHANGELOG.image
            : chrome.runtime.getURL(CHANGELOG.image);
        imgHTML = '<img id="po-cl-img" src="' + src + '" alt="" onerror="this.style.display=\'none\'">';
    }

    var overlay = document.createElement('div');
    overlay.id = 'po-cl-overlay';
    overlay.innerHTML =
        '<div id="po-cl-blur"></div>' +
        '<div id="po-cl-card">' +
            imgHTML +
            '<div id="po-cl-badge"><div id="po-cl-badge-dot"></div><span id="po-cl-badge-txt">New Update</span></div>' +
            '<div id="po-cl-title">' + CHANGELOG.title + '</div>' +
            '<div id="po-cl-sub">' + CHANGELOG.subtitle + '</div>' +
            bodyHTML +
            '<button id="po-cl-dismiss">' + (CHANGELOG.buttonLabel || 'Got it') + '</button>' +
        '</div>';

    document.body.appendChild(overlay);

    function dismiss() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s ease';
        setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
        var s = {}; s[CL_KEY] = CHANGELOG.version; chrome.storage.local.set(s);
    }
    document.getElementById('po-cl-dismiss').addEventListener('click', dismiss);
    document.getElementById('po-cl-blur').addEventListener('click', dismiss);
}

function maybeShowChangelog() {
    chrome.storage.local.get(CL_KEY, function(d) {
        if (chrome.runtime.lastError) return;
        if ((d[CL_KEY] || '') !== CHANGELOG.version) setTimeout(showChangelog, 1200);
    });
}

if (window.location.href.indexOf('pocketoption.com') !== -1) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeShowChangelog);
    else maybeShowChangelog();
}

chrome.runtime.onMessage.addListener(function(msg) {
    if (!msg) return;
    if (msg.type === 'PO_NOTIFY')          showPageNotif({ title: msg.title, desc: msg.desc, isError: !!msg.isError });
    if (msg.type === 'PO_POPOUT')          buildPopoutWidget();
    if (msg.type === 'PO_EDIT_START')      startEditor();
    if (msg.type === 'PO_UPDATE_AVAILABLE') showUpdateBanner(msg.current, msg.latest);
});

})();