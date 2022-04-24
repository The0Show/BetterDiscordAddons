/**
 * @name Interrupted
 * @version 1.1.0
 * @description Plays the Discord ping sound (or any sound of your choosing) randomly. This is inspired by MemeSounds by Lonk#6942, check it out!
 * @invite ZSn3cHP
 * @author The0Show#8908
 * @authorId 468093150217371649
 * @authorLink https://git.the0show.com
 * @source https://git.the0show.com/BetterDiscordPlugins/tree/main/Interrupted
 * @updateUrl https://raw.githubusercontent.com/The0Show/BetterDiscordPlugins/main/Interrupted/Interrupted.plugin.js
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

module.exports = (() => {
    /* Configuration */
    const config = {
        info: {
            name: "Interrupted",
            authors: [
                {
                    name: "The0Show#8908",
                    discord_id: "468093150217371649",
                    github_username: "The0Show",
                    twitter_username: "the0show",
                },
            ],
            version: "1.0.0",
            description:
                "Plays the Discord ping sound (or any sound of your choosing) randomly. This is inspired by MemeSounds by Lonk#6942, check it out!",
            github: "https://git.the0show.com/BetterDiscordPlugins/tree/main/Interrupted",
            github_raw:
                "https://raw.githubusercontent.com/The0Show/BetterDiscordPlugins/main/Interrupted/Interrupted.plugin.js",
        },
        defaultConfig: [
            {
                id: "setting",
                name: "Sound Settings",
                type: "category",
                collapsible: true,
                shown: true,
                settings: [
                    {
                        id: "customSound",
                        name: "Custom Sound",
                        note: "The sound to play. Defaults to the Discord mention sound.",
                        type: "textbox",
                        placeholder:
                            "https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",
                    },
                    {
                        id: "timeout",
                        name: "Max Timeout",
                        note: "The maximum amount of time the plugin will wait before playing the sound (in seconds)",
                        type: "textbox",
                        value: 7200,
                        placeholder: 7200,
                    },
                ],
            },
        ],
        changelog: [
            {
                title: "First Release",
                items: ["added everything"],
            },
        ],
    };

    return !global.ZeresPluginLibrary
        ? class {
              constructor() {
                  this._config = config;
              }
              getName() {
                  return config.info.name;
              }
              getAuthor() {
                  return config.info.authors.map((a) => a.name).join(", ");
              }
              getDescription() {
                  return config.info.description;
              }
              getVersion() {
                  return config.info.version;
              }
              load() {
                  BdApi.showConfirmationModal(
                      "Library Missing",
                      `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                      {
                          confirmText: "Download Now",
                          cancelText: "Cancel",
                          onConfirm: () => {
                              require("request").get(
                                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                                  async (err, res, body) => {
                                      if (err)
                                          return require("electron").shell.openExternal(
                                              "https://betterdiscord.app/Download?id=9"
                                          );
                                      await new Promise((r) =>
                                          require("fs").writeFile(
                                              require("path").join(
                                                  BdApi.Plugins.folder,
                                                  "0PluginLibrary.plugin.js"
                                              ),
                                              body,
                                              r
                                          )
                                      );
                                  }
                              );
                          },
                      }
                  );
              }
              start() {}
              stop() {}
          }
        : (([Plugin, Api]) => {
              const plugin = (Plugin, Api) => {
                  try {
                      return class Interrupted extends Plugin {
                          constructor() {
                              super();
                              this.timeout = null;
                              this.prevTimeout = 0;
                          }

                          getSettingsPanel() {
                              return this.buildSettingsPanel().getElement();
                          }

                          async load() {}

                          async timeoutFunction() {
                              this.timeout = setTimeout(() => {
                                  let audio = new Audio(
                                      this.settings.setting.customSound
                                          ? this.settings.setting.customSound
                                          : "https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3"
                                  );
                                  audio.play();
                                  this.timeoutFunction();
                              }, this.getRandomInt((this.settings.setting.timeout ? parseInt(this.settings.setting.timeout) : 7200) * 1000));
                          }

                          getRandomInt(max) {
                              return Math.floor(Math.random() * max);
                          }

                          /**
                           * Runs when the plugin is activated, including reloads.
                           */
                          start() {
                              this.prevTimeout = parseInt(
                                  this.settings.setting.timeout
                              );
                              this.timeoutFunction();
                          }

                          /**
                           * Runs when the plugin is deactivated, either via the interface or via script
                           */
                          stop() {
                              if (this.timeout) clearTimeout(this.timeout);
                              this.timeout = null;
                          }

                          /**
                           * Keeps the timeout setting updated live
                           */
                          observer() {
                              if (
                                  parseInt(this.settings.setting.timeout) !=
                                  this.prevTimeout
                              ) {
                                  if (this.timeout) clearTimeout(this.timeout);

                                  const mistakeMessages = [
                                      "You're making a terrible mistake...",
                                      "You're going to regret this...",
                                      "The0Show is not responsible for any damage done to your speakers or your ears caused directly or indirectly by this plugin.",
                                      "This will hurt. A lot.",
                                      "Headphone warning!",
                                      "Have fun!",
                                      "I'm going to enjoy this.",
                                      "I don't think you want to do this...",
                                  ];

                                  if (
                                      parseInt(this.settings.setting.timeout) <=
                                          0 &&
                                      this.settings.setting.timeout != ""
                                  )
                                      BdApi.showToast(
                                          mistakeMessages[
                                              this.getRandomInt(
                                                  mistakeMessages.length
                                              )
                                          ],
                                          { type: "warning", icon: true }
                                      );

                                  this.timeoutFunction();

                                  this.prevTimeout = parseInt(
                                      this.settings.setting.timeout
                                  );
                              }
                          }
                      };
                  } catch (e) {
                      console.error(e);
                  }
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
