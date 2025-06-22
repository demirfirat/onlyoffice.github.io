((window) => {
    window.Asc.plugin.init = function() {
        console.log("TextCleaner plugin initialized");
    };

    // Plugin yüklendiğinde çağrılır
    window.Asc.plugin.onLoad = function() {
        console.log("TextCleaner plugin loaded");
        
        // HTML Temizle butonu (panel) -> plugin.button(0)
        const htmlCleanBtn = document.getElementById("clean-button");
        if (htmlCleanBtn) {
            htmlCleanBtn.disabled = false;
            htmlCleanBtn.addEventListener("click", () => {
                window.Asc.plugin.button(0);
            });
        }
        
        // Select All kutusu
        const selectAllBox = document.getElementById("select-all-options");
        if (selectAllBox) {
            selectAllBox.onclick = () => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#select-all-options)');
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = selectAllBox.checked;
                }
            };
        }
        
        // Format butonları
        initFormatButtons();
        
        // Butonumuz hazır olduğunu bildir
        this.executeCommand("close", "");
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
        
        // Değişkenleri scope üzerinden geçir
        Asc.scope.formatType = formatType;
        Asc.scope.formatValue = value;
        
        // API çağrısını yap
        window.Asc.plugin.callCommand(() => {
            const oDocument = Api.GetDocument();
            if (!oDocument) return;
            
            const oSelection = Api.GetSelection();
            if (!oSelection || oSelection.IsEmpty()) return;
            
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
            
            oSelection.SetTextPr(oTextPr);
        }, true);
    }
    
    // Temizleme işlemini çalıştır
    function runCleanCommand() {
        // Ayarları al
        const settings = {
            removeMultipleSpaces: document.getElementById("remove-multiple-spaces")?.checked || false,
            removeLineBreaks: document.getElementById("remove-line-breaks")?.checked || false,
            removeTrailingSpaces: document.getElementById("remove-trailing-spaces")?.checked || false
        };

        Asc.scope.settings = settings;

        // 1) Seçili metni al
        window.Asc.plugin.executeMethod("GetSelectedText", [{"Numbering": false, "Math": false}], (selectedText) => {
            if (!selectedText) {
                window.Asc.plugin.executeMethod("ShowNotification", ["Lütfen temizlenecek metni seçin."]);
                return;
            }

            const cleanedText = cleanText(selectedText);
            if (cleanedText === selectedText) {
                window.Asc.plugin.executeMethod("ShowNotification", ["Değişiklik gerekmedi"]);
                return;
            }

            // 2) Seçileni sil, temiz metni ekle
            window.Asc.plugin.executeMethod("RemoveSelectedContent", [], () => {
                window.Asc.plugin.executeMethod("PasteText", [cleanedText], () => {
                    window.Asc.plugin.executeMethod("ShowNotification", ["Temizleme tamamlandı!"]);
                });
            });
        });

        // Yardımcı temizleme fonksiyonu
        function cleanText(text) {
            if (Asc.scope.settings.removeMultipleSpaces) {
                text = text.replace(/[ \t]+/g, ' ');
            }
            if (Asc.scope.settings.removeLineBreaks) {
                text = text.replace(/\r?\n/g, ' ');
            }
            if (Asc.scope.settings.removeTrailingSpaces) {
                text = text.trim();
            }
            return text;
        }
    }

    // Belge içeriği hazır olduğunda
    window.Asc.plugin.onDocumentContentReady = function() {
        console.log("Document content ready");
    };
})(window); 