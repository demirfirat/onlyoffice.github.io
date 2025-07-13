((window) => {
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

    function runCleanCommand() {
        const settings = {
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
        Asc.scope.settings = settings;

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
        }

        console.log("All text cleaning operations completed");
    }



    window.Asc.plugin.onTranslate = () => {
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
        document.getElementById("AllParameters").innerHTML = window.Asc.plugin.tr("AllParameters");
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
        setTr("ToggleCase");
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
})(window);