"use strict";
/**
 * Copyright (c) Bucher + Suter.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cli_1 = require("./cli");
const postBuildDeletes_1 = require("./postBuildDeletes");
function default_1(context, pluginOptions) {
    return {
        name: 'docusaurus-plugin-includes',
        configureWebpack(config, _isServer, _utils) {
            const pluginContentDocsPath = path_1.default.join('plugin-content-docs', 'lib', 'markdown', 'index.js');
            let docsPluginInclude = [];
            if (config.module && config.module.rules) {
                var foundContentDocsPlugin = false;
                config.module.rules.forEach(rule => {
                    if (rule === "...") {
                        return;
                    }
                    if (!foundContentDocsPlugin && rule.use && rule.include) {
                        const includesArray = rule.include;
                        const useArray = rule.use;
                        useArray.forEach(useItem => {
                            if (typeof useItem == 'object' && useItem.loader) {
                                if (useItem.loader.endsWith(pluginContentDocsPath)) {
                                    foundContentDocsPlugin = true;
                                }
                            }
                        });
                        if (foundContentDocsPlugin) {
                            docsPluginInclude = [...includesArray]; // copy the include paths docusaurus-plugin-content-docs 
                        }
                    }
                });
            }
            const loaderOptions = {
                replacements: pluginOptions.replacements,
                embeds: pluginOptions.embeds,
                sharedFolders: pluginOptions.sharedFolders
            };
            return {
                module: {
                    rules: [{
                            test: /(\.mdx?)$/,
                            include: docsPluginInclude,
                            exclude: /\_import\_/,
                            use: [
                                {
                                    loader: path_1.default.resolve(__dirname, './includesLoader.js'),
                                    options: loaderOptions,
                                },
                            ],
                        }],
                },
            };
        },
        injectHtmlTags() {
            if (pluginOptions.injectedHtmlTags) {
                return pluginOptions.injectedHtmlTags;
            }
            return {};
        },
        extendCli(cli) {
            cli
                .command('includes:copySharedFolders')
                .description('Copy the configured shared folders')
                .action(() => {
                (0, cli_1.copySharedFolders)(pluginOptions.sharedFolders, context.siteDir);
            });
            cli
                .command('includes:cleanCopySharedFolders')
                .description('Delete existing target folders first, copySharedFolders')
                .action(() => {
                (0, cli_1.cleanCopySharedFolders)(pluginOptions.sharedFolders, context.siteDir);
            });
        },
        async postBuild(_props) {
            if (pluginOptions.postBuildDeletedFolders) {
                await (0, postBuildDeletes_1.postBuildDeleteFolders)(pluginOptions.postBuildDeletedFolders);
            }
        },
    };
}
exports.default = default_1;
