(function () {
    var theme = localStorage.getItem("site-theme") || "claro";
    if (theme !== "claro" && theme !== "escuro" && theme !== "alto-contraste") {
        theme = "claro";
    }
    document.documentElement.setAttribute("data-theme", theme);

    var scale = localStorage.getItem("site-font-scale") || "100";
    document.documentElement.setAttribute("data-font-scale", scale);
})();
