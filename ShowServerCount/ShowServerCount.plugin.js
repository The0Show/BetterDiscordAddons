/**
 * @name ShowServerCount
 * @author The0Show
 * @description Shows your server count in the "Too Many Servers" dialog and the BetterDiscord public servers button.
 * @version 1.0.0
 * @authorLink https://the0show.com
 * @donate https://the0show.com/donate
 * @website https://the0show.com/projects/bdPlugins/suslinks
 * @updateUrl https://raw.githubusercontent.com/The0Show/BetterDiscordAddons/main/ShowServerCount/ShowServerCount.plugin.js
 */

/*@cc_on
@if (@_jscript)
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already, no further action is needed.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed! Put plugins in this folder in the future :)", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/

// BIG TODO: Servers in closed folders aren't counted
module.exports = class ShowServerCount {
    constructor() {
        this.prevCount = 0;
        this.prevURL = "";
        this.hasShownClosedFolderWarning = false;
    }

    async load() {}

    /**
     * Runs when the plugin is activated, including reloads.
     */
    start() {
        if (document.getElementById("bd-pub-button")) {
            document.getElementById("bd-pub-button").innerText = `${
                document.getElementsByClassName("bd-guild").length
            } servers`;
        }
    }

    /**
     * Runs when the plugin is deactivated, either via the interface or via script
     */
    stop() {
        // if the public server button is visible, set it back to "public"
        if (document.getElementById("bd-pub-button")) {
            document.getElementById("bd-pub-button").innerText = `public`;
            document.getElementById("bd-pub-button").style = "";
        }
    } // Required function. Called when the plugin is deactivated

    observer(changes) {
        try {
            document
                .querySelectorAll(
                    '[class="colorStandard-21JIj7 size16-rrJ6ag"]'
                )
                .forEach((text) => {
                    if (
                        text.innerText.startsWith(
                            "We love the enthusiasm, but you've hit the"
                        )
                    )
                        text.innerHTML =
                            "<p>We love the enthusiasm, but you're in " +
                            document.getElementsByClassName("bd-guild").length +
                            ' servers, which is over your limit.</p><p>Join up to 200 servers, use your server emoji everywhere, <span class="learnMoreLink-39KFEr" role="button" tabindex="0">and more with Discord Nitro!</span></p>';
                });

            if (
                document.getElementById("bd-pub-button") &&
                (document.getElementsByClassName("bd-guild").length !==
                    this.prevCount ||
                    window.location.href !== this.prevURL)
            ) {
                document.getElementById("bd-pub-button").style.fontSize = "58%";
                document.getElementById("bd-pub-button").innerText = `${
                    document.getElementsByClassName("bd-guild").length
                } server${
                    document.getElementsByClassName("bd-guild").length === 1
                        ? ""
                        : "s"
                }`;

                // right now, servers in closed folders aren't accounted for
                if(document.getElementsByClassName("closedFolderIconWrapper-3tRb2d").length > 0 && !this.hasShownClosedFolderWarning){
                    BdApi.alert("ShowServerCount", "Any servers in closed folders aren't accounted for at the moment.");
                    this.hasShownClosedFolderWarning = true;
                } else {
                    this.hasShownClosedFolderWarning = false;
                }

                this.prevCount =
                    document.getElementsByClassName("bd-guild").length;
                this.prevURL = window.location.href;
            }
        } catch (err) {
            console.error(err);
            BdApi.showConfirmationModal(
                `ShowServerCount has encounted a ${err.name}`,
                [err.message, "The plugin has attempted to disable itself."],
                { danger: false, confirmText: "Okay", cancelText: "" }
            );
            BdApi.Plugins.disable("ShowServerCount");
        }
    } // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
};
/*@end@*/
