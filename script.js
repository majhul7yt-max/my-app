const pricing = {
    // أسود وأبيض
    bw: {
        // وجه واحد
        single: [
            { min: 1, max: 30, price: 0.50 },
            { min: 31, max: 50, price: 0.40 },
            { min: 51, max: 80, price: 0.35 },
            { min: 81, max: 100, price: 0.30 },
            { min: 101, max: 200, price: 0.25 },
            { min: 201, max: Infinity, price: 0.20 }
        ],

        // وجه وقفى
        double: [
            { min: 1, max: 30, price: 0.60 },
            { min: 31, max: 50, price: 0.50 },
            { min: 51, max: 80, price: 0.45 },
            { min: 81, max: 100, price: 0.40 },
            { min: 101, max: 200, price: 0.35 },
            { min: 201, max: Infinity, price: 0.30 }
        ]
    },

    // ملون
    color: {
        // وجه واحد
        single: [
            { min: 1, max: 30, price: 1.00 },
            { min: 31, max: 50, price: 0.90 },
            { min: 51, max: 80, price: 0.80 },
            { min: 81, max: 100, price: 0.70 },
            { min: 101, max: 200, price: 0.60 },
            { min: 201, max: Infinity, price: 0.50 }
        ],

        // وجه وقفى
        double: [
            { min: 1, max: 30, price: 1.20 },
            { min: 31, max: 50, price: 1.10 },
            { min: 51, max: 80, price: 1.00 },
            { min: 81, max: 100, price: 0.90 },
            { min: 101, max: 200, price: 0.80 },
            { min: 201, max: Infinity, price: 0.70 }
        ]
    }
};


// أسعار التغليف
const bindingPrices = {
    none: 0,
    spiral: 7,
    tape: 5
};


// عناصر الاختيار (قوائم منسدلة)
const sizeSelect = document.querySelector("[data-size-select]");
const colorSelect = document.querySelector("[data-color-select]");
const sidesSelect = document.querySelector("[data-sides-select]");
const bindingSelect = document.querySelector("[data-binding-select]");


// أزرار + و - لعدد الصفحات
const paperCountInput = document.getElementById("paperCount");
const decreaseBtn = document.getElementById("decreaseBtn");
const increaseBtn = document.getElementById("increaseBtn");

if (decreaseBtn && increaseBtn && paperCountInput) {
    decreaseBtn.addEventListener("click", () => {
        const current = Number(paperCountInput.value) || 0;
        const next = Math.max(0, current - 1);
        paperCountInput.value = next;
    });

    increaseBtn.addEventListener("click", () => {
        const current = Number(paperCountInput.value) || 0;
        paperCountInput.value = current + 1;
    });
}


// البحث عن سعر الورقة حسب الكمية
function getPricePerPaper(count, color, sides) {

    const tiers = pricing[color][sides];

    const tier = tiers.find(item => {
        return count >= item.min && count <= item.max;
    });

    return tier ? tier.price : 0;
}


// اسم التغليف
function getBindingName(binding) {

    if (binding === "none") return "بدون تغليف";
    if (binding === "spiral") return "حلزوني";
    if (binding === "tape") return "شطرطون";

    return "-";
}


// تنسيق السعر مع رمز الريال
function formatPrice(value) {
    const amount = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
    return amount + " ﷼";
}


// زر احسب السعر
const calculateBtn = document.getElementById("calculateBtn");

calculateBtn.addEventListener("click", () => {

    const input = document.getElementById("paperCount");
    const count = Number(input.value);

    if (!count || count < 1) {
        alert("فضلاً أدخل عدد الصفحات.");
        input.focus();
        input.classList.remove("price-pop");
        void input.offsetWidth;
        input.classList.add("price-pop");
        return;
    }

    if (!sizeSelect.value || !colorSelect.value || !sidesSelect.value || !bindingSelect.value) {
        alert("فضلاً أكمل جميع الخيارات قبل الحساب.");
        return;
    }

    const selectedSize = sizeSelect.value;
    const selectedColor = colorSelect.value;
    const selectedSides = sidesSelect.value;
    const selectedBinding = bindingSelect.value;

    // تأثير حساب بسيط
    calculateBtn.classList.add("is-calculating");
    calculateBtn.textContent = "جاري الحساب…";

    setTimeout(() => {

        const pricePerPaper = getPricePerPaper(
            count,
            selectedColor,
            selectedSides
        );

        const printingPrice = count * pricePerPaper;
        const bindingPrice = bindingPrices[selectedBinding];
        const total = printingPrice + bindingPrice;

        document.getElementById("printingPrice").textContent =
            formatPrice(printingPrice);

        document.getElementById("resultSizeLine").textContent =
            `${selectedSize} × ${count}`;

        document.getElementById("resultColor").textContent =
            selectedColor === "bw" ? "أسود وأبيض" : "ملون";

        document.getElementById("resultSides").textContent =
            selectedSides === "single" ? "وجه واحد" : "وجه وقفى";

        document.getElementById("resultBinding").textContent =
            getBindingName(selectedBinding);

        document.getElementById("bindingPrice").textContent =
            bindingPrice > 0 ? formatPrice(bindingPrice) : "-";

        animateNumber(
            document.getElementById("totalPrice"),
            total,
            500
        );

        // إعادة تشغيل حركات الأسعار
        [
            document.getElementById("printingPrice"),
            document.getElementById("bindingPrice"),
            document.getElementById("totalPrice")
        ].forEach(el => {
            el.classList.remove("price-pop");
            void el.offsetWidth;
            el.classList.add("price-pop");
        });

        const resultSection = document.getElementById("result");
        resultSection.classList.remove("hidden");
        resultSection.classList.remove("reveal");
        void resultSection.offsetWidth;
        resultSection.classList.add("reveal");

        calculateBtn.classList.remove("is-calculating");
        calculateBtn.textContent = "إعادة الحساب";

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 280);
});


// عداد متحرك للإجمالي
function animateNumber(element, target, duration = 500) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        element.textContent = formatPrice(target);
        return;
    }

    const startValue = Number(element.dataset.value || 0);
    const startTime = performance.now();

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (target - startValue) * eased;

        element.textContent = formatPrice(current);
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            element.textContent = formatPrice(target);
            element.dataset.value = target;
        }
    }

    requestAnimationFrame(tick);
}

// حركة خفيفة جدًا مع الماوس على بطاقة الحاسبة — سطح المكتب فقط
const calcCard = document.querySelector(".calc-card");

if (calcCard && window.matchMedia("(pointer: fine)").matches) {
    calcCard.addEventListener("pointermove", (event) => {
        const rect = calcCard.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        calcCard.style.transform =
            `perspective(900px) rotateX(${(-y * 1.8).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-3px)`;
    });

    calcCard.addEventListener("pointerleave", () => {
        calcCard.style.transform = "";
    });
}

// وميض خفيف عند زيادة/إنقاص الصفحات
[decreaseBtn, increaseBtn].forEach((button) => {
    if (!button || !paperCountInput) return;

    button.addEventListener("click", () => {
        paperCountInput.classList.remove("price-pop");
        void paperCountInput.offsetWidth;
        paperCountInput.classList.add("price-pop");
    });
});

// تحريك الحقول عند تغيير الاختيار
[sizeSelect, colorSelect, sidesSelect, bindingSelect].forEach((select) => {
    if (!select) return;

    select.addEventListener("change", () => {
        const wrap = select.closest(".select-wrap");
        if (!wrap) return;

        wrap.classList.remove("select-changed");
        void wrap.offsetWidth;
        wrap.classList.add("select-changed");
    });
});
