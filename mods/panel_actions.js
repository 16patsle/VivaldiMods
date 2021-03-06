/*
* Panel Actions (A Mod for Vivaldi)
* LonM.vivaldi.net
* No Copyright Reserved
*/

(function panel_actions(){
    "use strict";

    /*
    Dictionary of additional actions.
    They will be added to the toolbar in the order specified below.
    Enabled: Whether the action is enabled
    Content Script: Wheter this action should execute on the web page or in the browser
    Script: A function(){}
    Display: The innerHTML of the toolbar button
    Display Class: One or more classes to give the button
    */
    const ACTIONS = {

        zoom_out: {
            title: "Decrease zoom",
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.getZoom(current => {
                    webview.setZoom(current -= 0.1, update_zoom_label);
                });
            },
            display: `-`,
            display_class: `zoom-out`
        },

        zoom_reset: {
            title: "Set zoom to 100%",
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.setZoom(1, update_zoom_label);
            },
            display: `100%`,
            display_class: `zoom-reset`
        },

        zoom_in: {
            title: "Increase zoom",
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.getZoom(current => {
                    webview.setZoom(current += 0.1, update_zoom_label);
                });
            },
            display: `+`,
            display_class: `zoom-in`
        },

        invert: {
            title: "Invert the colours on the page",
            enabled: true,
            content_script: true,
            script: function(){
                const style_element = document.createElement('style');
                style_element.innerHTML = `
                    html { background-color: white;}
                    body.inverted {filter: invert(1) hue-rotate(180deg);}
                    body.inverted img,
                    body.inverted video {filter: invert(1) hue-rotate(180deg);}`;
                document.body.appendChild(style_element);
                document.body.classList.toggle("inverted");
            }, /* eye icon stolen from vivaldi */
            display: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" height="10px" width="10px">
                <path fill-rule="evenodd" d="M8 13c3.636 0 6.764-2.067 8-5-1.236-2.933-4.364-5-8-5s-6.764 2.067-8 5c1.236 3.035 4.364 5 8 5zm0-1c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0-2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"></path>
            </svg>`,
            display_class: "panel-action-invert"
        },

        terminate: {
            title: "Kills the panel to free memory",
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.terminate();
            },
            display: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 -1 26 26" height="10px" width="10px">
                <path d="M9.4 18l-1.4-1.4 4.6-4.6-4.6-4.6 1.4-1.4 4.6 4.6 4.6-4.6 1.4 1.4-4.6 4.6 4.6 4.6-1.4 1.4-4.6-4.6z"></path>
            </svg>`,
            display_class: `panel-action-terminate`
        },

        mute: {
            title: "Toggle mute state",
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.isAudioMuted(mute => {
                    webview.setAudioMuted(!mute);
                    document.querySelector(".panel.webpanel.visible .panel-action-mute").textContent = mute ? `🔊` : `🔇`;
                });
            },
            display: `🔊`,
            display_class: `panel-action-mute`
        },

        template: {
            title: "",
            enabled: false,
            content_script: false,
            script: function(){

            },
            display: ``,
            display_class: ``
        },
    };

    /* Observe chages to the active panel */
    const PANEL_CHANGE_OBSERVER = new MutationObserver(mutationrecords => {
        const panel = document.querySelector(".panel.webpanel.visible");
        if(panel){
            add_panel_controls(panel);
        }
    });

    /* Wait until the panel is ready before activating the mod */
    function begin_observe(){
        const panels = document.querySelector("#panels");
        if(panels){
            PANEL_CHANGE_OBSERVER.observe(panels, {attributes: true, subtree: true});
        } else { setTimeout(begin_observe, 500); }
    }

    /* Update the label with the correct zoom percentage */
    function update_zoom_label(){
        const webview = document.querySelector(".panel.webpanel.visible webview");
        const panelZoom = document.querySelector(".panel.webpanel.visible .zoom-reset");
        if(!panelZoom){
            return;
        }
        webview.getZoom(current => {
            panelZoom.innerHTML = Math.floor(current * 100) + "%";
        });
    }

    /* Injects a content script onto the page */
    function content_script(scriptMethod){
        const webview = document.querySelector("div.panel.webpanel.visible webview");
        const scriptText = "("+scriptMethod+")()";
        webview.executeScript({code: scriptText});
    }

    /* Create a panel header toolbar button */
    function panel_mod_button(action){
        const newBtn = document.createElement("button");
        newBtn.className = action.display_class+" button-toolbar-small mod-panel-action";
        newBtn.innerHTML = action.display;
        if(action.content_script){
            newBtn.addEventListener("click", event => {content_script(action.script);});
        } else {
            newBtn.addEventListener("click", action.script);
        }
        newBtn.title = action.title;
        return newBtn;
    }

    /* Create the control buttons for the actions and add them to the specified header */
    function add_panel_controls(panel){
        const alreadyAdded = panel.querySelector("footer");
        if(alreadyAdded){return;}
        const footer = document.createElement("footer");
        for(const key in ACTIONS){
            const action = ACTIONS[key];
            if(action.enabled){
                const newButton = panel_mod_button(action);
                footer.appendChild(newButton);
            }
        }
        panel.appendChild(footer);
    }

    /* Start 500ms after the browser is opened */
    setTimeout(begin_observe, 500);
})();
