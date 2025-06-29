((window) => {
    window.Asc.plugin.init = function() {
        console.log("TextCleaner plugin initialized");
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

    // Plugin yüklendiğinde çağrılır
    window.Asc.plugin.onLoad = function() {
        console.log("TextCleaner plugin loaded");
        // Format butonlarını başlat
        initFormatButtons();
        // this.executeCommand("close", ""); // Remove auto-close so plugin stays open
    };

    // OnlyOffice'in standart butonlarını ele alan işlev
    // id=0 standardında "OK" butonudur
    window.Asc.plugin.button = function(id) {
        if (id === 0) { // OK butonu - temizleme işlemi
            console.log("Clean button clicked (OK button)");
            runCleanCommand();
        } else {
            this.executeCommand("close", "");
        }
    };
    
    // Format butonlarını başlat
    function initFormatButtons() {
        // Bold
        const boldBtn = document.getElementById("font-bold");
        if (boldBtn) {
            boldBtn.onclick = () => applyFormat("Bold");
        }
        // Italic
        const italicBtn = document.getElementById("font-italic");
        if (italicBtn) {
            italicBtn.onclick = () => applyFormat("Italic");
        }
        // Underline
        const underlineBtn = document.getElementById("font-underline");
        if (underlineBtn) {
            underlineBtn.onclick = () => applyFormat("Underline");
        }
        // Strikeout
        const strikeoutBtn = document.getElementById("font-strikeout");
        if (strikeoutBtn) {
            strikeoutBtn.onclick = () => applyFormat("Strikeout");
        }
        // Caps
        const capsBtn = document.getElementById("text-caps");
        if (capsBtn) {
            capsBtn.onclick = () => applyFormat("Caps");
        }
        // Color
        const colorPicker = document.getElementById("text-color-picker");
        if (colorPicker) {
            colorPicker.onchange = () => {
                applyFormat("Color", colorPicker.value);
            };
        }
        // Font family
        const fontFamily = document.getElementById("font-family-select");
        if (fontFamily) {
            fontFamily.onchange = () => {
                applyFormat("FontFamily", fontFamily.value);
            };
        }
        // Font size
        const fontSize = document.getElementById("font-size-select");
        if (fontSize) {
            fontSize.onchange = () => {
                applyFormat("FontSize", fontSize.value);
            };
        }
    }
    
    // Formatlama uygula
    function applyFormat(formatType, value) {
        console.log(`Applying format: ${formatType}`, value);
        Asc.scope.formatType = formatType;
        Asc.scope.formatValue = value;
        window.Asc.plugin.callCommand(() => {
            const oDocument = Api.GetDocument();
            if (!oDocument) return;
            const oRangeSel = oDocument.GetRangeBySelect();
            if (!oRangeSel) return;
            const oTextPr = Api.CreateTextPr();
            switch (Asc.scope.formatType) {
                case "Bold":
                    oTextPr.SetBold(true);
                    break;
                case "Italic":
                    oTextPr.SetItalic(true);
                    break;
                case "Underline":
                    oTextPr.SetUnderline(true);
                    break;
                case "Strikeout":
                    oTextPr.SetStrikeout(true);
                    break;
                case "Caps":
                    oTextPr.SetCaps(true);
                    break;
                case "Color":
                    oTextPr.SetColor(Asc.scope.formatValue);
                    break;
                case "FontFamily":
                    oTextPr.SetFontFamily(Asc.scope.formatValue);
                    break;
                case "FontSize":
                    oTextPr.SetFontSize(parseInt(Asc.scope.formatValue));
                    break;
            }
            oRangeSel.SetTextPr(oTextPr);
        }, false);
    }
    
    // Temizleme işlemini çalıştır
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
        if (settings.removeBold) {
            window.Asc.plugin.callCommand(() => {
                const oDocument = Api.GetDocument();
                if (!oDocument) return;
                const oRangeSel = oDocument.GetRangeBySelect();
                // if no selection, we'll process entire document below

                // Helper to clear bold formatting in a range of runs
                const clearBoldInRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].GetBold && runs[r].GetBold()) {
                            runs[r].SetBold(false);
                        }
                    }
                };

                if (oRangeSel) {
                    // Apply to the selected range only
                    oRangeSel.SetBold(false);
                } else {
                    // Apply to the whole document
                    const paragraphs = oDocument.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        const runs = paragraphs[i].GetRuns();
                        if (runs && runs.length) {
                            clearBoldInRuns(runs);
                        }
                    }
                }
            }, false);
        }

        // Remove italic formatting if requested
        if (settings.removeItalic) {
            window.Asc.plugin.callCommand(() => {
                const oDocument = Api.GetDocument();
                if (!oDocument) return;
                const oRangeSel = oDocument.GetRangeBySelect();

                const clearItalicInRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].GetItalic && runs[r].GetItalic()) {
                            runs[r].SetItalic(false);
                        }
                    }
                };

                if (oRangeSel) {
                    oRangeSel.SetItalic(false);
                } else {
                    const paragraphs = oDocument.GetAllParagraphs();
                    for (let i = 0; i < paragraphs.length; i++) {
                        const runs = paragraphs[i].GetRuns();
                        if (runs && runs.length) {
                            clearItalicInRuns(runs);
                        }
                    }
                }
            }, false);
        }

        // Remove underline
        if (settings.removeUnderline) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const clearUnderlineRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].GetUnderline && runs[r].GetUnderline()) {
                            runs[r].SetUnderline(false);
                        }
                    }
                };

                if (sel) {
                    sel.SetUnderline(false);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) clearUnderlineRuns(runs);
                    }
                }
            }, false);
        }

        // Remove strikethrough
        if (settings.removeStrikeout) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const clearStrikeRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].GetStrikeout && runs[r].GetStrikeout()) {
                            runs[r].SetStrikeout(false);
                        }
                    }
                };

                if (sel) {
                    sel.SetStrikeout(false);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) clearStrikeRuns(runs);
                    }
                }
            }, false);
        }

        // Clear text color
        if (settings.clearTextColor) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const clearColorRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].SetColor) runs[r].SetColor(0, 0, 0, true);
                    }
                };

                if (sel) {
                    sel.SetColor(0, 0, 0, true);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) clearColorRuns(runs);
                    }
                }
            }, false);
        }

        // Remove highlight
        if (settings.removeHighlight) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const clearHighlightRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        if (runs[r].GetHighlight && runs[r].GetHighlight() !== "none") {
                            runs[r].SetHighlight("none");
                        }
                    }
                };

                if (sel) {
                    sel.SetHighlight("none");
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) clearHighlightRuns(runs);
                    }
                }
            }, false);
        }

        // Remove background shading and outline
        if (settings.removeBgOutline) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const noStroke = Api.CreateStroke(0, Api.CreateSolidFill(Api.CreateRGBColor(0, 0, 0)));

                const clearBgOutlineRuns = (runs) => {
                    for (let r = 0; r < runs.length; r++) {
                        // Clear shading (background)
                        if (runs[r].GetShd && runs[r].GetShd()) {
                            runs[r].SetShd("clear", 255, 255, 255);
                        }
                        // Clear outline
                        if (runs[r].GetOutLine && runs[r].GetOutLine()) {
                            runs[r].SetOutLine(noStroke);
                        }
                    }
                };

                const clearParagraphBorders = (paras) => {
                    for (let k = 0; k < paras.length; k++) {
                        const pPr = paras[k].GetParaPr && paras[k].GetParaPr();
                        if (pPr && pPr.SetLeftBorder) {
                            pPr.SetLeftBorder("none", 0, 0, 0, 0, 0);
                            pPr.SetRightBorder("none", 0, 0, 0, 0, 0);
                            pPr.SetTopBorder("none", 0, 0, 0, 0, 0);
                            pPr.SetBottomBorder("none", 0, 0, 0, 0, 0);
                            pPr.SetBetweenBorder && pPr.SetBetweenBorder("none", 0, 0, 0, 0, 0);
                        }
                    }
                };

                const clearParagraphShading = (paras) => {
                    for (let k = 0; k < paras.length; k++) {
                        if (paras[k].SetShd) paras[k].SetShd("clear", 255, 255, 255);
                    }
                };

                if (sel) {
                    // Clear shading
                    sel.SetShd("clear", 255, 255, 255);
                    const tp = Api.CreateTextPr();
                    tp.SetOutLine(noStroke);
                    sel.SetTextPr(tp);
 
                    const selParas = sel.GetAllParagraphs();
                    if (selParas && selParas.length) {
                        clearParagraphBorders(selParas);
                        clearParagraphShading(selParas);
                        // also iterate runs for shading removal
                        for (let sp = 0; sp < selParas.length; sp++) {
                            if (selParas[sp].GetRuns) {
                                const runs = selParas[sp].GetRuns();
                                if (runs && runs.length) clearBgOutlineRuns(runs);
                            }
                        }
                    }
                } else {
                    const paras = doc.GetAllParagraphs();
                    if (paras && paras.length) {
                        clearParagraphBorders(paras);
                        clearParagraphShading(paras);
                        for (let p = 0; p < paras.length; p++) {
                            const runs = paras[p].GetRuns();
                            if (runs && runs.length) clearBgOutlineRuns(runs);
                        }
                    }
                }
            }, false);
        }

        // Reset letter spacing
        if (settings.resetLetterSpacing) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();
                const applySpacingZero = (runsOrRange) => {
                    if (runsOrRange.SetSpacing) {
                        runsOrRange.SetSpacing(0);
                    } else if (Array.isArray(runsOrRange)) {
                        for (let i = 0; i < runsOrRange.length; i++) {
                            if (runsOrRange[i].SetSpacing) runsOrRange[i].SetSpacing(0);
                        }
                    }
                };
                if (sel) {
                    applySpacingZero(sel);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) applySpacingZero(runs);
                    }
                }
            }, false);
        }

        // Reset vertical offset (baseline position)
        if (settings.resetVertOffset) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();
                const applyPosZero = (runsOrRange) => {
                    if (runsOrRange.SetPosition) {
                        runsOrRange.SetPosition(0);
                    } else if (Array.isArray(runsOrRange)) {
                        for (let i = 0; i < runsOrRange.length; i++) {
                            if (runsOrRange[i].SetPosition) runsOrRange[i].SetPosition(0);
                        }
                    }
                };
                if (sel) {
                    applyPosZero(sel);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) applyPosZero(runs);
                    }
                }
            }, false);
        }

        // Apply standard font family / size if specified
        if (settings.targetFontFamily || settings.targetFontSize) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument();
                if (!doc) return;
                const sel = doc.GetRangeBySelect();

                const applyFontProps = (runs) => {
                    const tp = Api.CreateTextPr();
                    if (Asc.scope.settings.targetFontFamily) tp.SetFontFamily(Asc.scope.settings.targetFontFamily);
                    if (Asc.scope.settings.targetFontSize) tp.SetFontSize(Asc.scope.settings.targetFontSize * 2);
                    for (let i = 0; i < runs.length; i++) {
                        runs[i].SetTextPr(tp);
                    }
                };

                if (sel) {
                    const tp = Api.CreateTextPr();
                    if (Asc.scope.settings.targetFontFamily) tp.SetFontFamily(Asc.scope.settings.targetFontFamily);
                    if (Asc.scope.settings.targetFontSize) tp.SetFontSize(Asc.scope.settings.targetFontSize * 2);
                    sel.SetTextPr(tp);
                } else {
                    const paras = doc.GetAllParagraphs();
                    for (let p = 0; p < paras.length; p++) {
                        const runs = paras[p].GetRuns();
                        if (runs && runs.length) applyFontProps(runs);
                    }
                }
                // font standardization done
            }, false);
        }

        // Text case conversion
        if (settings.textCaseOption !== "none") {
            const convertCase = (txt, opt) => {
                switch (opt) {
                    case "sentence":
                        return txt.replace(/([^\.\?!]*[\.\?!\s+]|[^\.\?!]+)/g, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
                    case "lower":
                        return txt.toLowerCase();
                    case "upper":
                        return txt.toUpperCase();
                    case "capitalize":
                        return txt.replace(/\b(\w)(\w*)/g, (_,f,r)=> f.toUpperCase()+r.toLowerCase());
                    case "toggle":
                        return txt.split('').map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join('');
                    default:
                        return txt;
                }
            };

            window.Asc.plugin.executeMethod("GetSelectedText", [{"Numbering": false, "Math": false}], (selectedText) => {
                if (!selectedText) return;
                const newText = convertCase(selectedText, settings.textCaseOption);
                if (newText === selectedText) return;
            window.Asc.plugin.executeMethod("RemoveSelectedContent", [], () => {
                    window.Asc.plugin.executeMethod("PasteText", [newText], () => {});
                });
            });
        }

        // Disable ALL CAPS
        if (settings.disableAllCaps) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument(); if (!doc) return;
                const sel = doc.GetRangeBySelect();
                const clearCapsRuns = (runs)=>{ for(let i=0;i<runs.length;i++){ if(runs[i].GetCaps && runs[i].GetCaps()) runs[i].SetCaps(false);} };
                if (sel) { sel.SetCaps(false); }
                else { const paras=doc.GetAllParagraphs(); for(let p=0;p<paras.length;p++){ const runs=paras[p].GetRuns(); if(runs&&runs.length) clearCapsRuns(runs);} }
            },false);
        }

        // Disable Small Caps
        if (settings.disableSmallCaps) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument(); if (!doc) return;
                const sel = doc.GetRangeBySelect();
                const clearSmallCapsRuns = (runs)=>{ for(let i=0;i<runs.length;i++){ if(runs[i].GetSmallCaps && runs[i].GetSmallCaps()) runs[i].SetSmallCaps(false);} };
                if (sel) { sel.SetSmallCaps(false); }
                else { const paras=doc.GetAllParagraphs(); for(let p=0;p<paras.length;p++){ const runs=paras[p].GetRuns(); if(runs&&runs.length) clearSmallCapsRuns(runs);} }
            },false);
        }

        // Reset to baseline (vert align)
        if (settings.resetBaseline) {
            window.Asc.plugin.callCommand(() => {
                const doc = Api.GetDocument(); if (!doc) return;
                const sel = doc.GetRangeBySelect();
                const resetRuns = (runs)=>{ for(let i=0;i<runs.length;i++){ if(runs[i].SetVertAlign) runs[i].SetVertAlign("baseline"); } };
                if (sel) { sel.SetVertAlign && sel.SetVertAlign("baseline"); }
                else { const paras=doc.GetAllParagraphs(); for(let p=0;p<paras.length;p++){ const runs=paras[p].GetRuns(); if(runs&&runs.length) resetRuns(runs);} }
            },false);
        }
    }

    window.Asc.plugin.onDocumentContentReady = function() {
        const cleanBtn = document.getElementById('clean-button');
        if (!cleanBtn) return;
        window.Asc.plugin.callCommand(() => {
            const doc = Api.GetDocument();
            const paras = doc ? doc.GetAllParagraphs() : [];
            return paras && paras.length > 0 && (paras[0].GetRuns && paras[0].GetRuns().length > 0);
        }, false, (hasContent) => {
            cleanBtn.disabled = !hasContent;
        });
    };

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
})(window); 