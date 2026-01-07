import type { LogEntry } from '../types'

const removeTimestamp = (line: string): string => {
  return line.replace(/^\[\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\]\s*/, '').trim();
};

const readFileWithEncoding = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let content: string;
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true });
      content = decoder.decode(uint8Array);
      if (!content.includes('�')) {
        return content;
      }
    } catch {
    }
    try {
      const decoder = new TextDecoder('shift_jis');
      content = decoder.decode(uint8Array);
      if (content.includes('指定したレイヤーは存在しません') ||
          content.match(/[ひらがなカタカナ漢字]+/) ||
          !content.includes('�')) {
        return content;
      }
    } catch {
    }
    try { // should not be needed
      const decoder = new TextDecoder('euc-jp');
      content = decoder.decode(uint8Array);
      if (!content.includes('�')) {
        return content;
      }
    } catch {
    }
    const fallbackDecoder = new TextDecoder('utf-8', { fatal: false });
    return fallbackDecoder.decode(uint8Array);
  } catch (error) {
    console.warn('Encoding detection failed, using default file.text():', error);
    return await file.text();
  }
};

export const analyzeSpice2xLogs = async (file: File): Promise<LogEntry[]> => {
  const fileContent = await readFileWithEncoding(file);
  const entries: LogEntry[] = [];
  const lines = fileContent.split('\n');
  let globalSoftId = "UNKNOWN";
  let globalPatchVersion = "";
  const globalLaunchParams = [];
  const globalDataLoadErrors = [];
  const globalPatchesUsed = [];
  let BadDataWarning = false;
  let is64Bit = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLogLine = removeTimestamp(line);

    /*
    PROBLEMS,WARNINGS
    */
    if (cleanLogLine.includes("W:SuperstepSound: Audio device is not available!!!")){
      let description = cleanLogLine
      description += "\n\nPrevents the game from booting, as it cannot find a suitable audio device.\n\n";
      description += "Recommendation(s)\n\n"
      description += "1. Verify which audio mode your game is currently set to use.\n";
      description += "2. Ensure your default audio device is set to the correct sample rate for your selected audio mode.\n";
      description += "3. If you cannot use the required sample rate, try switching to a different audio mode or device.\n";
      description += "4. Refer to your game's Game Setup guide, paying special attention to the Configuring audio section.\n";
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "No compatible audio device found.",
        description: description
      });
    }

    if(cleanLogLine.includes("EXCEPTION_ACCESS_VIOLATION")){
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "EXCEPTION_ACCESS_VIOLATION Raised",
        description: "If you have RTSS or Afterburner installed, please shut them down before launching. If you have another issue, try to solve that first and this may be resolved."
      });
    }

    if(cleanLogLine.includes("EXCEPTION_INT_DIVIDE_BY_ZERO")){
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "EXCEPTION_INT_DIVIDE_BY_ZERO Raised",
        description: "Try disabling some of your patches"
      });
    }

    if(cleanLogLine.includes("F:afpu-heap: malloc failed size=428088")){
      const description = "In spice2x config try setting Heap Size (-h) to 201326592"
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "Not enough Heap Memory",
        description: description
      });
    }

    if(cleanLogLine.includes("W:ea3-pos: ea3_report_posev: no such node: /coin/kfc_game_s_standard_plus")){
      const description = "You may need to edit your ea3-config.xml, see the following for a fix: https://github.com/22vv0/asphyxia_plugins/releases/tag/kfc-6.1.0b"
      entries.push({
        id: entries.length + 1,
        type: 'warning',
        title: "SDVX Coin ea3-config.xml Issue",
        description: description
      });
    }

    if(cleanLogLine.includes("F:GraphicUtility: Timeout AddLoadBuff")){
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "DISK I/O is timing out in-game",
        description: "Your disk read speed may be too slow. Try adding an anti-virus exception for your data's folder"
      });
    }

    if(cleanLogLine.includes("EXCEPTION_ILLEGAL_INSTRUCTION")){
      let description = "Your CPU is too old and doesn't support a necessary instruction set.\n"
      description += "There may exists a patch that can allow you to boot the game without some features\n\n"
      description += "iidx25+ requires SSE4.2, iidx31+ requires AVX2"
      entries.push({
        id: entries.length + 1,
        type: 'error',
        title: "CPU does not support a necessary instruction",
        description: description
      });
    }

    /*
    INFO/METADATA RELATED
    */
    if (cleanLogLine.startsWith("I:avs-ea3: soft id code:")) {
      const softIdCode = cleanLogLine.replace("I:avs-ea3: soft id code: ", "").trim();
      entries.unshift({
        id: 0,
        type: 'info',
        title: "Game Information",
        description: softIdCode
      });
      globalSoftId = softIdCode;
    }

    else if (cleanLogLine.startsWith("I:launcher:")) {
      const launcherInfo = cleanLogLine.replace("I:launcher: ", "").trim();
      if(cleanLogLine.includes("SpiceTools Bootstrap (x32)")){
        is64Bit = false;
      }
      const versionRegex = /^\d+\.\d+-V-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
      const dateMatch = launcherInfo.match(/\d{4}-\d{2}-\d{2}/);
      const extractedDate = dateMatch ? dateMatch[0] : "Unknown Spice2x Version";
      if (versionRegex.test(launcherInfo)) {
        entries.push({
          id: 1,
          type: 'info',
          title: "spice2x Version",
          description: extractedDate
        });

        const response = await fetch("https://api.github.com/repos/spice2x/spice2x.github.io/releases/latest");
        if(!response.ok){
          continue;
        }
        const extractedDateTag = extractedDate.slice(2);
        const spice2xGHData: any = await response.json();
        if(spice2xGHData["tag_name"] != extractedDateTag){
          entries.push({
            id: 1,
            type: 'warning',
            title: "spice2x version does not match the latest stable build",
            description: "If you experience issues, you should first update to the latest version of spice2x ("+spice2xGHData["tag_name"] + ")"
          });
        }
      } else if (launcherInfo === "arguments:") {
        const launch_args: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextCleanLine = removeTimestamp(nextLine);
          if (nextCleanLine === "" || !nextCleanLine.startsWith("-")) {
            break;
          }
          launch_args.push(nextCleanLine);
          globalLaunchParams.push(nextCleanLine);
          j++;
        }
        if (launch_args.length > 0) {
          entries.push({
            id: 2,
            type: 'info',
            title: "Launch Arguments",
            description: launch_args.join('\n')
          });
        }
        i = j - 1;
      }
    }

    // spice2x auto-troubleshooter
    else if (cleanLogLine.startsWith("W:troubleshooter:")) {
      let troubleshooterContent = "";
      let j = i + 1;
      let foundStart = false;
      let foundEnd = false;

      while (j < lines.length && !foundEnd) {
        const currentLine = lines[j];
        const currentCleanLine = removeTimestamp(currentLine);

        if (currentCleanLine.includes("/-------------------------- spice2x auto-troubleshooter")) {
          foundStart = true;
          j++;
          continue;
        }

        if (currentCleanLine.includes("\\------------------------- spice2x auto-troubleshooter")) {
          foundEnd = true;
          break;
        }

        if (foundStart) {
          troubleshooterContent += currentCleanLine + "\n";
        }

        j++;
      }

      if (troubleshooterContent.trim()) {
        entries.push({
          id: 4,
          type: 'info',
          title: "Auto-Troubleshooter",
          description: troubleshooterContent.trim()
        });
      }

      i = j;
    }

    else if(cleanLogLine.startsWith("I:avs-game: loaded successfully")){
      if(is64Bit && !cleanLogLine.includes("0x180000000")){
        entries.push({
          id: entries.length + 1,
          type: 'warning',
          title: "Unexpected Load Address",
          description: "The game was loaded at an unexpected address, which may cause issues with some aspects of the game. If you have RTSS or Afterburner installed, please shut them down before launching"
        });
      }
    }


    else if(cleanLogLine.startsWith("W:CtrlSound:")){
      const pattern = /^Voice\[\d+\] of Bank\[\d+\] is not loaded\.$/
      if(pattern.test(cleanLogLine) && !BadDataWarning){
        let description = "You are missing necessary files, you may be able to continue playing but this may cause issues with some aspects of the game\n\n"
        description += cleanLogLine
        BadDataWarning = true;
        entries.push({
          id: entries.length + 1,
          type: 'warning',
          title: "Data is Incomplete",
          description: description
        })
      }
    }
    else if(cleanLogLine.includes("指定したレイヤーは存在しません") ||
            cleanLogLine.includes("W:CTexture: no such texture:")){
      globalDataLoadErrors.push(cleanLogLine);
    }

    else if(cleanLogLine.startsWith("I:patchmanager")){
      const patchManagerInfo = cleanLogLine.replace("I:patchmanager: ", "").trim();

      if (patchManagerInfo === "patches file info:") {
        let j = i + 1;
        let jsonContent = "";
        let braceCount = 0;
        let foundOpenBrace = false;

        while (j < lines.length) {
          const nextLine = lines[j];
          const nextCleanLine = removeTimestamp(nextLine);

          if (nextCleanLine.includes("{")) {
            foundOpenBrace = true;
          }

          if (foundOpenBrace) {
            jsonContent += nextCleanLine + "\n";
            braceCount += (nextCleanLine.match(/\{/g) || []).length;
            braceCount -= (nextCleanLine.match(/\}/g) || []).length;

            if (braceCount === 0) {
              break;
            }
          }
          j++;
        }
        try {
          const patchInfo = JSON.parse(jsonContent.trim());
          let description = "🔧 Patches\n";
          description += `Game Code: ${patchInfo.gameCode || "Unknown"}\n`;
          description += `Version: ${patchInfo.version || "Unknown"}\n`;
          globalPatchVersion = patchInfo.version || "Unknown";
          description += `Last Updated: ${patchInfo.lastUpdated || "Unknown"}\n`;
          description += `Source: ${patchInfo.source || "Unknown"}\n`;
          let k = j + 1;
          while (k < lines.length) {
            const patchLine = lines[k];
            const patchCleanLine = removeTimestamp(patchLine);

            if (patchCleanLine.startsWith("I:patchmanager: auto apply:")) {
              const patchSetting = patchCleanLine.replace("I:patchmanager: auto apply: ", "").trim();
              const [patchName, status] = patchSetting.split(" = ");
              globalPatchesUsed.push(patchName);
              description += `${patchName} = ${status}\n`;
            } else if (!patchCleanLine.startsWith("I:patchmanager:")) {
              break;
            }
            k++;
          }

          entries.push({
            id: 3,
            type: 'info',
            title: "Patches Information",
            description: description.trim()
          });

          i = k - 1;
        } catch {
          const patchManagerRegex = /^\d+\.\d+-V-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
          if (patchManagerRegex.test(patchManagerInfo)) {
            entries.push({
              id: 3,
              type: 'info',
              title: "Patch Manager Version",
              description: patchManagerInfo
            });
          }
        }
      }
    }
  }

  // POST CHECKS -> After seeing all lines
  if(globalSoftId.startsWith("LDJ") && globalPatchVersion.includes("(010)") && !globalLaunchParams.includes("-iidxtdj")){
    let description = "You're using a 010 (TDJ) DLL but haven't enabled TDJ mode in spice2x.\n"
    description += "This will prevent the game from booting.\n\n"
    description += "--------------- Recommendations ---------------\n\n"
    description += "If your monitor supports 120Hz:\n\n"
    description += "  • Open spicecfg and go to the Options tab\n"
    description += "  • Enable IIDX TDJ Mode (-iidxtdj)\n"
    description += "  • Save configuration and restart the game\n\n"
    description += "If your monitor does NOT support 120Hz:\n\n"
    description += "  • Patch the game to force running in LDJ mode\n"
    description += "  OR\n\n"
    description += "  • Use a 012 (LDJ) DLL instead of the 010 (TDJ) DLL\n\n"
    description += "Info on patching: https://ttwr.moekyun.me/extras/patchsp2x/"
    entries.push({
      id: entries.length+1,
      type: 'error',
      title: "TDJ Mode Configuration Required",
      description
    });
  }

  if(globalSoftId.startsWith("KFC") && globalLaunchParams.includes("-dx9on12")
    && Number(globalSoftId.split(":").pop()) <= 2020122200
    &&  Number(globalSoftId.split(":").pop()) > 2019020600){
    entries.push({
      id: entries.length+1,
      type: 'warning',
      title: "DX 9 on 12 may cause freezing/stuttering SDVX Vivid Wave",
      description: "Try turning this off if you are playing SDVX Vivid Wave"
    });
  }

  if(globalSoftId.startsWith("KFC") && globalLaunchParams.includes("-sdvx720")
    && Number(globalSoftId.split(":").pop()) > 2020122200){
      entries.push({
        id: entries.length+1,
        type: 'warning',
        title: "SDVX Force 720p may not work",
        description: "Known to not work on Exceed Gear. Try using a different option to resize the game"
      })
  }

  if(globalSoftId.startsWith("LDJ") && globalLaunchParams.includes("-dx9on12") && Number(globalSoftId.split(":").pop()) > 2023090500){
      entries.push({
        id: entries.length+1,
        type: 'warning',
        title: "DX9 on 12 may crash iidx31+",
        description: "If you see テクスチャの取得に失敗 in logs after a crash, then try turning this off"
      })
  }

  if(globalLaunchParams.includes("-ea")&& globalLaunchParams.includes("-url")){
    entries.push({
      id: entries.length+1,
      type: 'warning',
      title: "-ea and -url shouldn't be used together",
      description: "You probably want one or the other. Use -url to connect to a network"
    })
  }


  if(globalDataLoadErrors.length > 0){
    let description = "The game is likely unable to boot due to missing essential files. This can be due to improperly applied updates or bad data."
    description += "\n\n"
    for (const error of globalDataLoadErrors) {
      description += `${error}\n\n`
    }
    description += "\n\n--------------- Recommendations ---------------\n\n"
    description += "1. Make sure there are no DLL files next to the main game directories (data, prop, etc.). If there are, move them all under the modules directory.\n\n"
    description+= "2. Perform a fresh installation using trusted data sources.\n\n"
    description += "\n\n"
    entries.push({
      id: entries.length+1,
      type: 'error',
      title: "Data is Incomplete",
      description
    });
  }




  return entries;
}
