((window) => {
    // State management for undo functionality
    let originalDocumentState = null;
    let hasCleanedDocument = false;
    let undoStepsCount = 0;

    window.Asc.plugin.init = function() {
        console.log("TextCleaner plugin initialized");
        refreshButtonState();
        setInterval(refreshButtonState, 1500);
    };
    
    function onDomReady() {
        // Select All functionality
        const selectAll = document.getElementById('select-all-options');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#select-all-options)');

        // Enable all parameters by default
        checkboxes.forEach(cb => cb.checked = true);
        if (selectAll) {
            selectAll.checked = true;
            selectAll.addEventListener('change', function() {
                const isChecked = this.checked;
                checkboxes.forEach(cb => cb.checked = isChecked);
            });
        }

        // Clean button click -> trigger Asc plugin button 0
        const cleanBtn = document.getElementById('clean-button');
        if (cleanBtn) {
            cleanBtn.addEventListener('click', () => {
                showLoadingOverlay();
                if (window.Asc && window.Asc.plugin && typeof window.Asc.plugin.button === 'function') {
                    window.Asc.plugin.button(0);
                }
            });
        }

        // Accordion toggle
        document.querySelectorAll('.acc-head').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.querySelector(btn.dataset.target);
                if (!target) return;
                const isOpen = target.style.display !== 'none';
                target.style.display = isOpen ? 'none' : 'block';
                // Toggle chevron SVG
                const chevron = btn.querySelector('.chevron');
                if (chevron) {
                    const rotation = isOpen ? '0deg' : '180deg';
                    chevron.style.transform = `rotate(${rotation})`;
                }
            });
        });
        // Set initial state for chevrons
        document.querySelectorAll('.acc-head').forEach(btn => {
            const target = document.querySelector(btn.dataset.target);
            const chevron = btn.querySelector('.chevron');
            if (target && chevron) {
                const isOpen = target.style.display !== 'none';
                chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });

    }
    // DOMContentLoaded eventini dinle
    document.addEventListener('DOMContentLoaded', onDomReady);


    window.Asc.plugin.button = function(id) {
        if (id === 0) { 
            console.log("Clean button clicked (OK button)");
            runCleanCommand();
        } else {
            this.executeCommand("close", "");
        }
    };

    function runCleanCommand(preset = null) {
        let settings;
        if (preset) {
            // Varsayılan false değerler
            settings = {
                removeBold: false,
                removeItalic: false,
                removeUnderline: false,
                removeStrikeout: false,
                clearTextColor: false,
                removeHighlight: false,
                removeBgOutline: false,
                resetLetterSpacing: false,
                resetVertOffset: false,
                targetFontFamily: "",
                targetFontSize: 0,
                textCaseOption: "none",
                disableAllCaps: false,
                disableSmallCaps: false,
                resetBaseline: false,
                ...preset // preset içindeki true değerler override eder
            };
        } else {
            settings = {
                removeBold: document.getElementById("remove-bold")?.checked || false,
                removeItalic: document.getElementById("remove-italic")?.checked || false,
                removeUnderline: document.getElementById("remove-underline")?.checked || false,
                removeStrikeout: document.getElementById("remove-strikeout")?.checked || false,
                clearTextColor: document.getElementById("clear-text-color")?.checked || false,
                removeHighlight: document.getElementById("remove-highlight")?.checked || false,
                removeBgOutline: document.getElementById("remove-bg-outline")?.checked || false,
                resetLetterSpacing: document.getElementById("reset-letter-spacing")?.checked || false,
                resetVertOffset: document.getElementById("reset-vert-offset")?.checked || false,
                targetFontFamily: document.getElementById("font-family-select")?.value || "",
                targetFontSize: parseInt(document.getElementById("font-size-select")?.value || "0"),
                textCaseOption: document.querySelector('input[name="text-case-option"]:checked')?.value || "none",
                disableAllCaps: document.getElementById("disable-all-caps")?.checked || false,
                disableSmallCaps: document.getElementById("disable-small-caps")?.checked || false,
                resetBaseline: document.getElementById("reset-baseline")?.checked || false
            };
        }

        Asc.scope.settings = settings;

        // Save original state before cleaning if not already saved
        if (!originalDocumentState) {
            saveOriginalDocumentState();
        }

        // Reset undo counter for new cleaning operation
        undoStepsCount = 0;

        // Eğer ALL CAPS veya Small Caps kapatılıyorsa ve kullanıcı ayrıca bir harf dönüşümü seçmediyse
        if ((settings.disableAllCaps || settings.disableSmallCaps) && settings.textCaseOption === "none") {
            settings.textCaseOption = "lower";
        }

        // Remove bold formatting if requested
    // Bold’ı kaldır seçeneği aktifse
    if (settings.removeBold) {
        window.Asc.plugin.callCommand(function () {
            const doc = Api.GetDocument();
            if (!doc) return;
    
            const range = doc.GetRangeBySelect();
            const textPr = Api.CreateTextPr();
            textPr.SetBold(false);
    
            if (range && range.GetText && range.GetText() !== "") {
                // Seçili metin varsa sadece oraya uygula
                range.SetTextPr(textPr);
            } else {
                // Seçim yoksa tüm paragraf(lar)a uygula
                const paragraphs = doc.GetAllParagraphs();
                for (let i = 0; i < paragraphs.length; i++) {
                    paragraphs[i].SetTextPr(textPr);
                }
            }
        }, false);
        undoStepsCount++;
    }
   
        // Italic'ı kaldır seçeneği aktifse
        if (settings.removeItalic) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetItalic(false);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Remove underline
        // Underline'ı kaldır seçeneği aktifse
        if (settings.removeUnderline) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetUnderline(false);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Remove strikethrough
        // Strikeout'u kaldır seçeneği aktifse
        if (settings.removeStrikeout) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetStrikeout(false);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Clear text color
        // Metin rengini temizle seçeneği aktifse
        if (settings.clearTextColor) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetColor(0, 0, 0, true);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Remove highlight
        // Highlight'ı kaldır seçeneği aktifse
        if (settings.removeHighlight) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetHighlight("none");
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Remove background shading and outline
        // Arkaplan ve çerçeve kaldır seçeneği aktifse
        if (settings.removeBgOutline) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const noStroke = Api.CreateStroke(0, Api.CreateSolidFill(Api.CreateRGBColor(0, 0, 0)));
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetShd("clear", 255, 255, 255);
                    const textPr = Api.CreateTextPr();
                    textPr.SetOutLine(noStroke);
                    range.SetTextPr(textPr);
                    
                    // Seçili alandaki paragraflarda border temizle
                    const selParas = range.GetAllParagraphs();
                    if (selParas) {
                        for (let p = 0; p < selParas.length; p++) {
                            const paraPr = selParas[p].GetParaPr();
                            if (paraPr) {
                                paraPr.SetLeftBorder("none", 0, 0, 0, 0, 0);
                                paraPr.SetRightBorder("none", 0, 0, 0, 0, 0);
                                paraPr.SetTopBorder("none", 0, 0, 0, 0, 0);
                                paraPr.SetBottomBorder("none", 0, 0, 0, 0, 0);
                                if (paraPr.SetBetweenBorder) paraPr.SetBetweenBorder("none", 0, 0, 0, 0, 0);
                            }
                        }
                    }
                } else {
                    // Seçim yoksa tüm dökümanı işle
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        // Paragraf shading temizle
                        paragraphs[i].SetShd("clear", 255, 255, 255);
                        
                        // Text properties ile outline temizle
                        const textPr = Api.CreateTextPr();
                        textPr.SetOutLine(noStroke);
                        paragraphs[i].SetTextPr(textPr);
                        
                        // Paragraf borders temizle
                        const paraPr = paragraphs[i].GetParaPr();
                        if (paraPr) {
                            paraPr.SetLeftBorder("none", 0, 0, 0, 0, 0);
                            paraPr.SetRightBorder("none", 0, 0, 0, 0, 0);
                            paraPr.SetTopBorder("none", 0, 0, 0, 0, 0);
                            paraPr.SetBottomBorder("none", 0, 0, 0, 0, 0);
                            if (paraPr.SetBetweenBorder) paraPr.SetBetweenBorder("none", 0, 0, 0, 0, 0);
                        }
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Reset letter spacing
        // Harf aralığını sıfırla seçeneği aktifse
        if (settings.resetLetterSpacing) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetSpacing(0);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Reset vertical offset (baseline position)
        // Dikey konumu sıfırla seçeneği aktifse
        if (settings.resetVertOffset) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetPosition(0);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Apply standard font family / size if specified
        // Font ailesi/boyutu belirtilmişse uygula
        if (settings.targetFontFamily || settings.targetFontSize) {
            // Settings değerlerini scope dışında sakla
            Asc.scope.targetFontFamily = settings.targetFontFamily;
            Asc.scope.targetFontSize = settings.targetFontSize;
            
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                
                if (Asc.scope.targetFontFamily) {
                    textPr.SetFontFamily(Asc.scope.targetFontFamily);
                }
                if (Asc.scope.targetFontSize) {
                    textPr.SetFontSize(Asc.scope.targetFontSize * 2);
                }
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Text case conversion - Düzeltilmiş versiyon
        if (settings.textCaseOption !== "none") {
            Asc.scope.textCaseOption = settings.textCaseOption;

            window.Asc.plugin.callCommand(function() {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                // Text dönüşüm fonksiyonu - case seçeneğine göre
                const convertCase = (text, caseOption) => {
                    switch (caseOption) {
                        case "upper":
                            return text.toUpperCase();
                        case "lower":
                            return text.toLowerCase();
                        case "sentence":
                            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                        case "capitalize":
                            return text.replace(/\b\w/g, l => l.toUpperCase());
                        case "toggle":
                            return text.split('').map(char => 
                                char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
                            ).join('');
                        default:
                            return text;
                    }
                };
        
                const range = doc.GetRangeBySelect();
                
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa
                    const selectedText = range.GetText();
                    const newText = convertCase(selectedText, Asc.scope.textCaseOption);
            
                    if (newText !== selectedText) {
                        range.Delete();
                        const oParagraph = Api.CreateParagraph();
                        oParagraph.AddText(newText);
                        doc.InsertContent([oParagraph]);
                    }
                } else {
                    // Seçim yoksa tüm paragrafları işle
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        const para = paragraphs[i];
                        const paraText = para.GetText();
                        const newText = convertCase(paraText, Asc.scope.textCaseOption);
                        
                        if (newText !== paraText) {
                            para.RemoveAllElements();
                            para.AddText(newText);
                        }
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Disable ALL CAPS
        // ALL CAPS'i kaldır seçeneği aktifse
        if (settings.disableAllCaps) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetCaps(false);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Disable Small Caps
        // Small Caps'i kaldır seçeneği aktifse
        if (settings.disableSmallCaps) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetSmallCaps(false);
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        // Reset to baseline (vertical alignment)
        // Baseline'a sıfırla seçeneği aktifse
        if (settings.resetBaseline) {
            window.Asc.plugin.callCommand(function () {
                const doc = Api.GetDocument();
                if (!doc) return;
        
                const range = doc.GetRangeBySelect();
                const textPr = Api.CreateTextPr();
                textPr.SetVertAlign("baseline");
        
                if (range && range.GetText && range.GetText() !== "") {
                    // Seçili metin varsa sadece oraya uygula
                    range.SetTextPr(textPr);
                } else {
                    // Seçim yoksa tüm paragraf(lar)a uygula
                    const paragraphs = doc.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        paragraphs[i].SetTextPr(textPr);
                    }
                }
            }, false);
            undoStepsCount++;
        }

        console.log("All text cleaning operations completed");
    }



    window.Asc.plugin.onTranslate = () => {
        // Eğer panel HTML öğeleri yoksa (arka plan variation) çeviri yapma
        if (!document.getElementById("PluginInstructions")) {
            return;
        }

        const addChevronTo = (id) => {
            const head = document.getElementById(id);
            if (!head) return;
            head.innerHTML = window.Asc.plugin.tr(id);
            const img = document.createElement('img');
            img.src = 'resources/light/chevron-down.svg';
            img.className = 'chevron';
            img.style.cssText = 'width:6px; float:right; transition:transform 0.2s';
            head.appendChild(img);
        };

        const setTr = (idKey) => {
            const el = document.getElementById(idKey);
            if (el) el.innerHTML = window.Asc.plugin.tr(idKey);
        };

        setTr("PluginInstructions");
        const allParamsEl = document.getElementById("AllParameters");
        if (allParamsEl) allParamsEl.innerHTML = window.Asc.plugin.tr("AllParameters");
        addChevronTo("ClearFormatting");
        setTr("RemoveBold");
        setTr("RemoveItalic");
        setTr("RemoveUnderline");
        setTr("RemoveStrikeout");
        setTr("ClearTextColor");
        setTr("RemoveHighlight");
        setTr("RemoveBgOutline");
        addChevronTo("FontStandardization");
        setTr("NormalizeSpaces");
        setTr("NormalizeNumbers");
        if (document.getElementById("ResetLetterSpacing")) document.getElementById("ResetLetterSpacing").innerHTML = window.Asc.plugin.tr("ResetLetterSpacing");
        if (document.getElementById("ResetVertOffset")) document.getElementById("ResetVertOffset").innerHTML = window.Asc.plugin.tr("ResetVertOffset");
        addChevronTo("TextCaseConversion");
        setTr("FixCasing");
        addChevronTo("SpecialFormatting");
        setTr("DisableAllCaps");
        setTr("DisableSmallCaps");
        setTr("ResetBaseline");
        setTr("clean-button");
        setTr("CaseNone");
        setTr("SentenceCase");
        setTr("LowerCase");
        setTr("UpperCase");
        setTr("CapitalizeEach");
        setTr("CleaningCompleted");
        setTr("OperationsApplied");
        setTr("RevertToOriginal");
        setTr("NewClean");
        setTr("DoNotClosePanel");
    }

    const Editor = {
        callCommand: func =>
            new Promise(resolve =>
                window.Asc.plugin.callCommand(func, false, true, resolve)
            ),
    };

    function toggleCleanButton(enabled) {
        const btn = document.getElementById('clean-button');
        if (btn) btn.disabled = !enabled;
    }

    async function docHasText() {
        return await Editor.callCommand(function () {
            const doc = Api.GetDocument();
            const text = doc.GetText({ Numbering: false });
            return text.trim().length > 0;
        });
    }

    async function refreshButtonState() {
        const hasText = await docHasText();
        toggleCleanButton(hasText);
    }

    window.Asc.plugin.event_onDocumentContentReady = refreshButtonState;
    window.Asc.plugin.event_onTargetChanged = refreshButtonState;

    // ==================== CONTEXT MENU FUNCTIONALITY ====================
    
    let plugin_contextMenuEvents = {};

    // Context menu show event
    window.Asc.plugin.event_onContextMenuShow = function(options) {
        console.log("TextCleaner context menu show event triggered", options);
        
        const tr = (key) => window.Asc.plugin.tr ? window.Asc.plugin.tr(key) : key;
        
        if (!options) return;

        let items = [];

        // Text Cleaner ana menü öğesi - tüm context türlerinde göster
        items.push({
            id: "textCleaner",
            text: tr("TextCleanerMenuTitle"), // translations'da TextCleanerMenuTitle anahtarı ekle
            // Işık / karanlık temaya uygun ikon seti
            icons: "resources/light/icon.svg",
            items: [
                {
                    id: "clearFormattingCtx",
                    text: tr("ClearFormatting"),
                    items: [
                        {
                            id: "removeBoldCtx",
                            text: tr("RemoveBold"),
                        },
                        {
                            id: "removeItalicCtx", 
                            text: tr("RemoveItalic"),
                        },
                        {
                            id: "removeUnderlineCtx",
                            text: tr("RemoveUnderline"), 
                        },
                        {
                            id: "removeStrikeoutCtx",
                            text: tr("RemoveStrikeout"),
                        },
                        {
                            id: "clearTextColorCtx",
                            text: tr("ClearTextColor"),
                        },
                        {
                            id: "removeHighlightCtx",
                            text: tr("RemoveHighlight"),
                        }
                    ]
                },
                {
                    id: "fontStandardizationCtx",
                    text: tr("FontStandardization"),
                    items: [
                        {
                            id: "resetLetterSpacingCtx",
                            text: tr("ResetLetterSpacing"),
                        },
                        {
                            id: "resetVertOffsetCtx",
                            text: tr("ResetVertOffset"),
                        }
                    ]
                },
                {
                    id: "textCaseConversionCtx",
                    text: tr("TextCaseConversion"),
                    items: [
                        {
                            id: "doNotChangeCaseCtx",
                            text: tr("CaseNone"),
                        },
                        {
                            id: "sentenceCaseCtx",
                            text: tr("SentenceCase"),
                        },
                        {
                            id: "lowerCaseCtx",
                            text: tr("LowerCase"),
                        },
                        {
                            id: "upperCaseCtx",
                            text: tr("UpperCase"),
                        },
                        {
                            id: "capitalizeEachWordCtx",
                            text: tr("CapitalizeEach"),
                        },
                        {
                            id: "toggleCaseCtx",
                            text: tr("ToggleCase"),
                        }
                    ]
                },
                {
                    id: "specialFormattingCtx",
                    text: tr("SpecialFormatting"),
                    items: [
                        {
                            id: "disableAllCapsCtx",
                            text: tr("DisableAllCaps"),
                        },
                        {
                            id: "disableSmallCapsCtx",
                            text: tr("DisableSmallCaps"),
                        },
                        {
                            id: "resetBaselineCtx",
                            text: tr("ResetBaseline"),
                        }
                    ]
                }
            ]
        });

        if (items.length > 0) {
            console.log("Adding TextCleaner context menu items:", items);
            
            window.Asc.plugin.executeMethod("AddContextMenuItem", [{
                guid: window.Asc.plugin.guid,
                items: items
            }]);
        }
    };

    // Context menu click event handler
    window.Asc.plugin.event_onContextMenuClick = function(id) {
        console.log("TextCleaner context menu clicked:", id);
        
        let itemData = undefined;
        let itemId = id;
        let itemPos = itemId.indexOf("_oo_sep_");
        
        if (itemPos !== -1) {
            itemData = itemId.slice(itemPos + 8);
            itemId = itemId.slice(0, itemPos);
        }

        if (plugin_contextMenuEvents && plugin_contextMenuEvents[itemId]) {
            plugin_contextMenuEvents[itemId].call(window.Asc.plugin, itemData);
        }
    };

    // Context menu fonksiyonları
    plugin_contextMenuEvents["removeBoldCtx"] = function() {
        console.log("Remove Bold from context menu");
        runCleanCommand({ removeBold: true });
    };

    plugin_contextMenuEvents["removeItalicCtx"] = function() {
        console.log("Remove Italic from context menu");
        runCleanCommand({ removeItalic: true });
    };

    plugin_contextMenuEvents["removeUnderlineCtx"] = function() {
        console.log("Remove Underline from context menu");
        runCleanCommand({ removeUnderline: true });
    };

    plugin_contextMenuEvents["removeStrikeoutCtx"] = function() {
        console.log("Remove Strikeout from context menu");
        runCleanCommand({ removeStrikeout: true });
    };

    plugin_contextMenuEvents["clearTextColorCtx"] = function() {
        console.log("Clear Text Color from context menu");
        runCleanCommand({ clearTextColor: true });
    };

    plugin_contextMenuEvents["removeHighlightCtx"] = function() {
        console.log("Remove Highlight from context menu");
        runCleanCommand({ removeHighlight: true });
    };
    plugin_contextMenuEvents["resetLetterSpacingCtx"] = function() {
        runCleanCommand({ resetLetterSpacing: true });
    };
    plugin_contextMenuEvents["resetVertOffsetCtx"] = function() {
        runCleanCommand({ resetVertOffset: true });
    }

    plugin_contextMenuEvents["doNotChangeCaseCtx"] = function() {
        runCleanCommand({ textCaseOption: "none" });
    };
    plugin_contextMenuEvents["sentenceCaseCtx"] = function() {
        runCleanCommand({ textCaseOption: "sentence" });
    };
    plugin_contextMenuEvents["lowerCaseCtx"] = function() {
        runCleanCommand({ textCaseOption: "lower" });
    };
    plugin_contextMenuEvents["upperCaseCtx"] = function() {
        runCleanCommand({ textCaseOption: "upper" });
    };
    plugin_contextMenuEvents["capitalizeEachWordCtx"] = function() {
        runCleanCommand({ textCaseOption: "capitalize" });
    };
    plugin_contextMenuEvents["toggleCaseCtx"] = function() {
        runCleanCommand({ textCaseOption: "toggle" });
    };

    plugin_contextMenuEvents["disableAllCapsCtx"] = function() {
        runCleanCommand({ disableAllCaps: true, textCaseOption: "lower" });
    };
    plugin_contextMenuEvents["disableSmallCapsCtx"] = function() {
        runCleanCommand({ disableSmallCaps: true, textCaseOption: "lower" });
    };
    plugin_contextMenuEvents["resetBaselineCtx"] = function() {
        runCleanCommand({ resetBaseline: true });
    };

    function showLoadingOverlay() {
        const loadingView = document.getElementById('loading-view');
        const mainContainer = document.querySelector('.main-container');
        if (!loadingView || !mainContainer) return;
        mainContainer.style.display = 'none';
        loadingView.style.display = 'block';

        // Hide after 1 second
        setTimeout(() => {
            loadingView.style.display = 'none';
            showActionButtons();
        }, 1000);
    }

    function saveOriginalDocumentState() {
        // Simple implementation: Mark that we have saved state
        // In real implementation, you would use proper document backup methods
        originalDocumentState = "saved";
        console.log("Document state saved before cleaning");
    }

    function showActionButtons() {
        const actionButtonsView = document.getElementById('action-buttons-view');
        const undoStepsInfo = document.getElementById('undo-steps-info');
        if (actionButtonsView) {
            actionButtonsView.style.display = 'block';
            hasCleanedDocument = true;
            
            // Show undo steps count
            if (undoStepsInfo) {
                undoStepsInfo.textContent = `${undoStepsCount} ${window.Asc.plugin.tr ? window.Asc.plugin.tr("OperationsApplied") : "operations applied"}`;
            }
            
            setupActionButtonHandlers();
        }
    }

    function setupActionButtonHandlers() {
        const revertButton = document.getElementById('revert-button');
        const newCleanButton = document.getElementById('new-clean-button');

        if (revertButton) {
            revertButton.onclick = function() {
                revertToOriginal();
            };
        }

        if (newCleanButton) {
            newCleanButton.onclick = function() {
                resetToMainView();
            };
        }
    }

    function revertToOriginal() {
        if (!originalDocumentState || undoStepsCount === 0) return;

        // Perform multiple undo operations based on the number of steps
        console.log(`Reverting ${undoStepsCount} operations...`);
        
        function performUndo(stepsRemaining) {
            if (stepsRemaining <= 0) {
                console.log("All undo operations completed");
                // Reset state and return to main view
                originalDocumentState = null;
                hasCleanedDocument = false;
                undoStepsCount = 0;
                resetToMainView();
                return;
            }
            
            window.Asc.plugin.executeMethod("Undo", null, function(result) {
                console.log(`Undo step ${undoStepsCount - stepsRemaining + 1} completed`);
                // Perform next undo with a small delay to ensure proper execution
                setTimeout(() => {
                    performUndo(stepsRemaining - 1);
                }, 100);
            });
        }
        
        performUndo(undoStepsCount);
    }

    function resetToMainView() {
        const actionButtonsView = document.getElementById('action-buttons-view');
        const mainContainer = document.querySelector('.main-container');
        
        if (actionButtonsView) {
            actionButtonsView.style.display = 'none';
        }
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }
    }

})(window);