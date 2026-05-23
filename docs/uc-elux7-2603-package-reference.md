# eLux 7 Package Reference — uc-elux7-2603

**Image version:** uc-elux7-2603  
**Platform:** eLux OS 7 (x86-64)  
**Document scope:** All Feature Package Modules (FPMs) and their parent EPMs

---

## Overview

This reference describes every package available in the `uc-elux7-2603` image container, organized by functional category. Use it when building a custom Image Definition File (IDF) to decide which packages to include.

Packages are grouped under their parent eLux Package Module (EPM). Each EPM represents a functional unit — selecting an EPM pulls in its mandatory FPMs automatically. Optional FPMs must be explicitly added to the image.

### Selection types

| Type | Icon | Meaning |
|------|------|---------|
| **Mandatory** | ⬛ | Always installed when the parent EPM is selected. Cannot be removed individually. |
| **Optional — pre-selected** | 🔵 | Installed by default; can be removed if the functionality is not needed. |
| **Optional** | ⬜ | Not installed by default. Add explicitly when the described feature is required. |

---

## Table of Contents

- [Application](#application)
- [Communication](#communication)
- [Driver](#driver)
- [Multimedia](#multimedia)
- [Network](#network)
- [Powermanagement](#powermanagement)
- [Security](#security)
- [System](#system)
- [Utility](#utility)
- [Miscellaneous](#miscellaneous)

---

## Application

Client applications providing end-user functionality — virtual desktop clients, browsers, and productivity tools.

### Amazon WorkSpaces Client for Linux

> Select when deploying Amazon WorkSpaces virtual desktops. The base component is mandatory; no optional sub-packages are available in this EPM.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `aws_client_base` | 2025.0.5296 | Amazon WorkSpaces Client base installation — Programs and libraries for the Amazon WorkSpaces Client for Linux. | ⬛ Always included with parent EPM. |

### Chromium Webbrowser

> Deploy when end users need a local Chromium browser for web applications or intranet access.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `chromium_base` | 133.0.6943.126.7.2509.0 | Executable file — Chromium web browser executable version 133.0.6943.126 | ⬛ Always included with parent EPM. |
| `chromium_de` | 133.0.6943.126.7.2507.0 | German Language Pack — German | 🔵 Included by default; remove if not required in your deployment. |
| `chromium_en_GB` | 133.0.6943.126.7.2507.0 | English (GB) Language Pack — English (GB) | 🔵 Included by default; remove if not required in your deployment. |
| `chromium_es` | 133.0.6943.126.7.2507.0 | Spanish Language Pack — Spanish | ⬜ Add when this specific feature is needed. |
| `chromium_fr` | 133.0.6943.126.7.2507.0 | French Language Pack — French | ⬜ Add when this specific feature is needed. |
| `chromium_l10n` | 133.0.6943.126.7.2507.0 | All Other Language Packs — Languages for: af am ar bg bn ca cs da el es-419 et fa fil fi gu he hi hr hu id it ja kn ko lt lv ml mr ms nb nl pl pt-BR pt-PT ro ru sk sl sr sv sw ta te th tr uk ur vi zh-CN zh-TW | ⬜ Add when this specific feature is needed. |

### Citrix extensions

> eLux-specific enhancements for the Citrix Workspace App, adding USB redirection, enhanced audio, and session reliability features. Recommended alongside `ica`.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `ctxext_uidialog` | 7.2603.0 | Dialog Extension — Extends Citrix Workspace functionality by extended UI capabilities and StoreFront features | 🔵 Included by default; remove if not required in your deployment. |
| `ctxext_ucselfservice` | 7.2601.0 | Self-service wrapper — Wrapper to self-service | ⬜ Requires `selfserviceui`. |
| `ctxext_ucselfservice_theme` | 7.2404.0 | Self-service dialog themes — Provides customized design for Citrix dialogs | ⬜ Requires `selfserviceui`, `ctxext_uidialog`. |

### Citrix Workspace app for Linux

> Citrix Workspace App (ICA client). The cornerstone package for any Citrix-based deployment. Pair with `citrix_extensions` for enhanced functionality.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `ica_base` | 26.01.0.150 | Programs and libraries — Citrix Workspace app 2601 for Linux Windows Terminal Server access via ICA. Copyright (c) 1996-2022 Citrix Systems, Inc. All rights reserved. Copyright (c) 1986-1997 RSA Security, Inc. All rights reserved. | ⬛ Always included with parent EPM. |
| `ica_lang_en` | 26.01.0.150 | Language pack English — English translation files | ⬛ Always included with parent EPM. |
| `ica_pna` | 26.01.0.150 | StoreFront and PNAgent utilities — Browse/launch XenDesktop and XenApp virtual desktops and applications, also includes PNAgent legacy support | ⬛ Always included with parent EPM. |
| `ica_sysprep` | 26.01.0.150 | Installation preparations — Prepares eLux for CWA installation | ⬛ Always included with parent EPM. |
| `ica_lang_de` | 26.01.0.150 | Language pack German — German translation files | 🔵 Included by default; remove if not required in your deployment. |
| `ica_utils` | 26.01.0.150 | Utilities and tools — Includes the CWA tools configmgr, conncenter, logmgr, nslaunch, xcapture | 🔵 Included by default; remove if not required in your deployment. |
| `ica_appprotection` | 26.01.0.150 | App protection — App protection is an add-on feature that provides enhanced security when you use Citrix Virtual Apps and Desktops. The feature restricts the ability of clients to be compromised by keylogging and screen capturing malware. App protection prevents exfiltration of confidential information such as user credentials and sensitive information displayed on the screen. The feature prevents users and attackers from taking screenshots and from using keyloggers to glean and exploit sensitive information. | ⬜ Cannot be installed alongside `firejailbase`. |
| `ica_bcr` | 26.01.0.150 | Browser Content Redirection (BCR) using Chromium Embedded Framework (CEF) — Redirects the contents of a web browser to a client device and creates a corresponding browser embedded within Citrix Workspace app. This feature offloads network usage, page processing, and graphics rendering to the endpoint. Doing so improves the user experience when browsing demanding webpages, especially webpages that incorporate HTML5 or Flash video. | ⬜ Requires `ca_certificates`, `ica_mmrdr`, `ica_browserrdr` …. |
| `ica_bcr_fluendo` | 140.0.7339.185 | Support Fluendo codecs in CWA-BCR — Use Fluendo codecs (AAC) within Citrix Workspace App / Browser content redirection | ⬜ Requires `ica_bcr`, `fluendosw`, `fluendosw_gst1_0_codecs`. Cannot be installed alongside `fluendo_ffmpeg_enabler_libffmpeg_cwa`. |
| `ica_blur` | 26.01.0.150 | Citrix blur camera support — Citrix blur camera support. Not applicable for plugins that handle camera on the their own. | ⬜ Add when this specific feature is needed. |
| `ica_browserrdr` | 26.01.0.150 | HDX Browser Content Redirection — Redirects the contents of a web browser to a client device and creates a corresponding browser embedded within Citrix Workspace app. This feature offloads network usage, page processing, and graphics rendering to the endpoint. Doing so improves the user experience when browsing demanding webpages, especially webpages that incorporate HTML5 or Flash video. | ⬜ Requires `ca_certificates`, `ica_mmrdr`. |
| `ica_customwebstore` | 26.01.0.150 | Custom Web Store Extension (experimental) — With the Custom Web Store extension you can access your organization's custom web store from the Citrix Workspace App. | ⬜ Add when this specific feature is needed. |
| `ica_desktoplock` | 26.01.0.150 | Desktoplock mode support — Adds desktoplock mode support. To use it: set AuthType to Citrix / 13, set DesktopLockStore and DesktopLockResource in terminal.ini, section Security. | ⬜ Requires `userauth`, `pcsc_lite`. |
| `ica_devicetrust` | 26.01.0.150 | deviceTRUST Client Extension — deviceTRUST adds real-time contextual access enabling granular access control based on device posture and user context. This allows organizations to continuously monitor and respond to changes, strengthening security and minimizing endpoint risk. | ⬜ Requires `pcsc_lite`. |
| `ica_h264` | 26.01.0.150 | HDX Webcam H.264 encoder support — HDX Webcam H.264 encoder support. Installs needed gstreamer plugins to allow HDXH264InputEnabled=True. If used hardware supports it, VA-API (with GPU acceleration) is used. Fallback is OpenH264 (encoding in CPU). | ⬜ Requires `gstreamer1_0_vaapi`, `gstreamer1_0_openh264`. |
| `ica_lang_es` | 26.01.0.150 | Language pack Spanish — Spanish translation files | ⬜ Add when this specific feature is needed. |
| `ica_lang_fr` | 26.01.0.150 | Language pack French — French translation files | ⬜ Add when this specific feature is needed. |
| `ica_lang_ja` | 26.01.0.150 | Language pack Japan — Japanese translation files | ⬜ Add when this specific feature is needed. |
| `ica_mmrdr` | 26.01.0.150 | HDX MediaStream Windows Media Redirection — HDX MediaStream redirects multimedia content rendering to Linux thin clients. This technology leverages the available media decoders on the user's device. | ⬜ Requires `gstreamer1pluginsfluendo`. |
| `ica_msteams` | 26.01.0.150 | HDX Microsoft Teams Optimization — HDX Microsoft Teams Optimization provides optimization for desktop-based Microsoft Teams using Citrix Virtual Apps and Desktops and Citrix Workspace app. By default, all necessary components are bundled into Citrix Workspace app and the Virtual Delivery Agent (VDA). | ⬜ Requires `libcpp1`, `wget`. |
| `ica_nsap` | 26.01.0.150 | Support for NetScaler App Experience (NSAP) virtual channel — The NetScaler App Experience (NSAP) virtual channel allows all HDX Insight data to be sourced from the NSAP virtual channel exclusively and sent uncompressed. This approach improves scalability and performance of sessions. | ⬜ Add when this specific feature is needed. |
| `ica_selfservice` | 26.01.0.150 | Self-service — A new graphical user interface (UI), like that in other Citrix Workspace apps, replaces the configuration manager, wfcmgr. After they are set up with an account, users can subscribe to desktops and applications, and then start them. To use the UI run the following command: selfservice | ⬜ Requires `desktop_environment`, `webkit2gtk-4.0`. |
| `ica_usbrdr` | 26.01.0.150 | HDX Plug-n-Play USB 2.0 — Citrix USB redirection module | ⬜ Add when this specific feature is needed. |
| `ica_webview` | 26.01.0.150 | Support of web based UI dialogs | ⬜ Add when this specific feature is needed. |

### eLuxRDP

> eLux native RDP client for Microsoft Remote Desktop and Windows virtual desktops. Select the base and any protocol extensions matching your environment.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `eluxrdp_base` | 2.6.1.7.2407.0 | Programs and libraries — eLuxRDP programs and libraries | ⬛ Always included with parent EPM. |
| `eluxrdp_gui` | 2.6.1.7.2501.0 | Graphical front-end — Graphical front-end for eLuxRDP | ⬛ Always included with parent EPM. |
| `eluxrdp_helper` | 4.0.0.7.2404.0 | Helper — The helper application rdpclient can be used to start remote desktop sessions directly from rdp files (f.e. to be called as browser helper application) | 🔵 Included by default; remove if not required in your deployment. |
| `eluxrdp_mmrdr` | 2.6.1.7.2404.0 | Enable multimedia redirection — RDP multimedia redirection with support for the following codecs (Video: WVC1, WMV3, H264/AVC1; Audio: WMA2, MP3, AAC, AC3). | ⬜ Add when this specific feature is needed. |

### evidian

> Evidian Web Access Manager and enterprise SSO. Select when Evidian is the identity management solution for your environment.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `evidianbase` | 1.5.8705.7.2505.0 | evidianbase — Basefiles for Evidian roaming session User Authentication Module | ⬛ Always included with parent EPM. |

### Firefox Webbrowser

> Mozilla Firefox ESR web browser. Deploy for local browser access alongside or instead of Chromium.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `firefox_base` | 128.14.0.7.2511.0 | Base files — Firefox base files. | ⬛ Always included with parent EPM. |
| `firefox_en_US` | 128.14.0.7.2509.0 | English (US) Language Pack — English (US) | ⬛ Always included with parent EPM. |
| `firefox_de` | 128.14.0.7.2509.0 | German Language Pack — German | 🔵 Included by default; remove if not required in your deployment. |
| `firefox_cs` | 128.14.0.7.2509.0 | Czech Language Pack | ⬜ Add when this specific feature is needed. |
| `firefox_da` | 128.14.0.7.2509.0 | Danish Language Pack — Danish | ⬜ Add when this specific feature is needed. |
| `firefox_el` | 128.14.0.7.2509.0 | Greek, Modern (1453-) Language Pack — Greek, Modern (1453-) | ⬜ Add when this specific feature is needed. |
| `firefox_en_GB` | 128.14.0.7.2509.0 | English (GB) Language Pack — English (GB) | ⬜ Add when this specific feature is needed. |
| `firefox_es_AR` | 128.14.0.7.2509.0 | Spanish (AR) Language Pack — Spanish (AR) | ⬜ Add when this specific feature is needed. |
| `firefox_es_CL` | 128.14.0.7.2509.0 | Spanish (CL) Language Pack — Spanish (CL) | ⬜ Add when this specific feature is needed. |
| `firefox_es_ES` | 128.14.0.7.2509.0 | Spanish (ES) Language Pack — Spanish (ES) | ⬜ Add when this specific feature is needed. |
| `firefox_es_MX` | 128.14.0.7.2509.0 | Spanish (MX) Language Pack — Spanish (MX) | ⬜ Add when this specific feature is needed. |
| `firefox_et` | 128.14.0.7.2509.0 | Estonian Language Pack — Estonian | ⬜ Add when this specific feature is needed. |
| `firefox_fi` | 128.14.0.7.2509.0 | Finnish Language Pack — Finnish | ⬜ Add when this specific feature is needed. |
| `firefox_fr` | 128.14.0.7.2509.0 | French Language Pack — French | ⬜ Add when this specific feature is needed. |
| `firefox_hr` | 128.14.0.7.2509.0 | Croatian Language Pack — Croatian | ⬜ Add when this specific feature is needed. |
| `firefox_hu` | 128.14.0.7.2509.0 | Hungarian Language Pack — Hungarian | ⬜ Add when this specific feature is needed. |
| `firefox_is` | 128.14.0.7.2509.0 | Icelandic Language Pack — Icelandic | ⬜ Add when this specific feature is needed. |
| `firefox_it` | 128.14.0.7.2509.0 | Italian Language Pack — Italian | ⬜ Add when this specific feature is needed. |
| `firefox_ja` | 128.14.0.7.2509.0 | Japanese Language Pack — Japanese | ⬜ Add when this specific feature is needed. |
| `firefox_nb_NO` | 128.14.0.7.2509.0 | Bokmål, Norwegian (NO) Language Pack — Bokmål, Norwegian (NO) | ⬜ Add when this specific feature is needed. |
| `firefox_nl` | 128.14.0.7.2509.0 | Dutch Language Pack | ⬜ Add when this specific feature is needed. |
| `firefox_openh264` | 1.8.1.1.7.2509.0 | OpenH264 integration for WebRTC — Integrate H.264 implementation to be used with WebRTC applications. | ⬜ Requires `openh264codec`. |
| `firefox_pl` | 128.14.0.7.2509.0 | Polish Language Pack — Polish | ⬜ Add when this specific feature is needed. |
| `firefox_pt_BR` | 128.14.0.7.2509.0 | Portuguese (BR) Language Pack — Portuguese (BR) | ⬜ Add when this specific feature is needed. |
| `firefox_pt_PT` | 128.14.0.7.2509.0 | Portuguese (PT) Language Pack — Portuguese (PT) | ⬜ Add when this specific feature is needed. |
| `firefox_ro` | 128.14.0.7.2509.0 | Romanian Language Pack — Romanian | ⬜ Add when this specific feature is needed. |
| `firefox_ru` | 128.14.0.7.2509.0 | Russian Language Pack — Russian | ⬜ Add when this specific feature is needed. |
| `firefox_sk` | 128.14.0.7.2509.0 | Slovak Language Pack — Slovak | ⬜ Add when this specific feature is needed. |
| `firefox_sl` | 128.14.0.7.2509.0 | Slovenian Language Pack — Slovenian | ⬜ Add when this specific feature is needed. |
| `firefox_sv_SE` | 128.14.0.7.2509.0 | Swedish (SE) Language Pack — Swedish (SE) | ⬜ Add when this specific feature is needed. |
| `firefox_tr` | 128.14.0.7.2509.0 | Turkish Language Pack — Turkish | ⬜ Add when this specific feature is needed. |

### Frame App

> Nutanix Frame virtual desktop client. Include when users connect to Nutanix Frame cloud desktops.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `frame_app_base` | 7.9.4.0 | Base files — Basefiles for Frame App | ⬛ Always included with parent EPM. |

### Imprivata Access Management

> Imprivata OneSign / FairWarning proximity-card tap-in/tap-out SSO. Include when Imprivata is the access management platform.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `imprivata_daemon` | 7.2603.0 | Imprivata backend daemon — Programs and libraries of the eLux imprivata backend daemon. | ⬛ Always included with parent EPM. |
| `imprivata_vd` | 7.2601.0 | Fast User switching support — Virtual channel (IMP1166) to support Fast User Switching | 🔵 Included by default; remove if not required in your deployment. |
| `imprivata_proximity_card_reader` | 7.2603.0 | Proximity Reader support — Support for IDEAS pcProx Proximity Reader | ⬜ Requires `systemlibs_libudev0`, `pcsc_lite`, `ccid`. |
| `imprivata_tester` | 7.2603.0 | Imprivata test D-Bus client/server — Command line test tool to send/receive eLux Imprivata D-Bus messages as server or client. Not intended for production usage. | ⬜ Requires `boost`, `boost_program_options`. |

### Microsoft AVD Client

> Microsoft Azure Virtual Desktop client. Select when endpoints connect to AVD or Windows 365 Cloud PC environments.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `libprotobuf_avd` | 7.2509.0 | protocol buffers C++ library (main and lite versions) — protocol buffers C++ library (lite version) for MS AVD Client | ⬛ Always included with parent EPM. |
| `ms_avd_client_base` | 7.2603.0 | AVD Client base files — Programs and libraries of the Microsoft AVD Client. | ⬛ Always included with parent EPM. |
| `opencv_avd` | 4.5.4.7.2509.0 | OpenCV library for MS AVD Client. — The Open Computer Vision Library is a collection of algorithms and sample code for various computer vision problems. The library is compatible with IPL (Intel's Image Processing Library) and, if available, can use IPP (Intel's Integrated Performance Primitives) for better performance. This package provides OpenCV library for MS AVD Client. | ⬛ Always included with parent EPM. |

### Microsoft Edge Webbrowser

> Microsoft Edge browser. Preferred for environments that require Edge-specific enterprise features or Microsoft 365 integration.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `microsoft_edge_stable` | 142.0.3595.53.7.2511.0 | Microsoft Edge Webbrowser — The web browser from Microsoft. Microsoft Edge is a browser that combines a minimal design with sophisticated technology to make the web faster, safer, and easier. | ⬛ Always included with parent EPM. |

### Omnissa Horizon Client for Linux

> Omnissa (formerly VMware) Horizon Client. Select when connecting to VMware/Omnissa Horizon virtual desktops or published applications.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `vmwareviewclient_client` | 2506 | Horizon Client — Omnissa Horizon Client | ⬛ Always included with parent EPM. |
| `vmwareviewclient_html5mmr` | 2506 | HTML5 Multimedia Redirection — Omnissa Horizon HTML5 Multimedia Redirection | ⬜ Requires `vmwareviewclient_pcoip`, `vmwareviewclient_libcef`. |
| `vmwareviewclient_libcef` | 2506 | Chromium Embedded Framework (CEF) — Omnissa Horizon Chromium Embedded Framework (CEF) library | ⬜ Add when this specific feature is needed. |
| `vmwareviewclient_pcoip` | 2506 | PCoIP — Omnissa Horizon PCoIP | ⬜ Requires `pulseaudio`. |
| `vmwareviewclient_printing` | 2506 | Integrated Printing — Omnissa Horizon Integrated Printing | ⬜ Requires `baseprinter`. |
| `vmwareviewclient_rtav` | 2506 | RTAV — Omnissa Horizon Real-Time Audio-Video | ⬜ Requires `vmwareviewclient_pcoip`, `gstreamer1_0`, `gstreamer1pluginsfluendo` …. |
| `vmwareviewclient_scanner` | 2506 | Scanner Redirection — Omnissa Horizon Scanner Redirection | ⬜ Requires `vmwareviewclient_pcoip`, `sane`. |
| `vmwareviewclient_scard` | 2506 | Smartcard Redirection — Omnissa Horizon Smartcard Redirection | ⬜ Requires `vmwareviewclient_pcoip`. |
| `vmwareviewclient_usb` | 2506 | USB Redirection — Omnissa Horizon USB Redirection | ⬜ Cannot be installed alongside `icausbrdr`. |

### Parallels RAS Client for Linux

> Parallels RAS (Remote Application Server) client. Select when connecting to Parallels RAS published desktops or applications.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `parallels_ras_client_base` | 20.2.25997.1 | Parallels RAS Client base installation — Programs and libraries for the Parallells RAS Client for Linux. | ⬛ Always included with parent EPM. |

### Qemu Guest Agent

> QEMU guest agent. Include when eLux runs as a QEMU/KVM virtual machine and guest-agent communication is needed.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `qemu_guest_agent_bin` | 10.2.1.7.2601.0 | Qemu Guest Agent | ⬛ Always included with parent EPM. |

### SSH Environment

> OpenSSH environment. Include the client for outbound SSH connections; add the server component only if inbound SSH management is required.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `openssh` | 8.9.7.2507.0 | OpenSSH — secure shell (SSH) client, for secure access to remote machines | ⬛ Always included with parent EPM. |
| `sshaskpass` | 8.9.7.2507.0 | Graphical User Interface — under X, asks user for a passphrase for ssh-add | ⬛ Always included with parent EPM. |

### VirtualBox guest support

> VirtualBox guest additions. Include only when running eLux as a VirtualBox VM, typically for lab or testing purposes.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `virtualbox_guest_utilities` | 6.1.50.7.2603.0 | VirtualBox guest utilities — Support for a VirtualBox guest like USB redirection and shared folders. | ⬛ Always included with parent EPM. |

## Communication

Real-time communication, conferencing, and collaboration solutions.

### Cisco JVDI Client

> Required for Cisco Jabber (Unified Communications) optimization inside virtual desktop sessions. Select the appropriate VDI plug-in for your hypervisor.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cisco_jvdi_base` | 15.2.0 | Cisco JVDI Client base binaries — Cisco JVDI extends the Cisco Jabber collaboration experience to virtualized environments by facilitating real-time voice and video traffic processing on the local devices. | ⬛ Always included with parent EPM. |

### Cisco TVDI Client

> Cisco Webex VDI optimization plug-in. Select when Webex meetings run inside a virtual desktop session for media-offload optimization.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cisco_webexvdi_base` | 45.12.0 | Cisco TVDI Client base binaries — Cisco TVDI extends the Cisco Teams collaboration experience to virtualized environments by facilitating real-time voice and video traffic processing on the local devices. | ⬛ Always included with parent EPM. |

### Cisco Webex Client for Linux

> Cisco Webex native client for local video meetings. Select instead of the VDI plug-in when meetings run directly on the endpoint.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cisco_webex_client_base` | 45.6.2.32823 | Cisco Webex Client base files — Programs and libraries of the Cisco Webex Client for Linux Version 45.6.2.32823. | ⬛ Always included with parent EPM. |

### Citrix HDX RealTime Media Engine

> Citrix HDX RealTime Media Engine — required for optimized Microsoft Teams or Skype for Business audio/video inside ICA sessions.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `citrix_hdxrtme_driver` | 2.9.700.3000 | Driver integration — Performs all signaling and media processing directly on the user device itself, offloading the server for maximum scalability, minimizing network bandwidth consumption and ensuring optimal audio-video quality. | ⬛ Always included with parent EPM. |

### Citrix Secure Access

> Citrix Secure Access (formerly Citrix Gateway) SSL VPN client. Include when users connect to Citrix environments via SSL VPN.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `citrix_secure_access_base` | 24.11.4.7.2503.0 | Citrix Secure Access Base — Citrix Secure Access is the Ubuntu VPN Client for connecting to Enterprise Network via NetScaler Gateway. Users can connect to corporate network and access remote resources securely. Please access the NetScaler Gateway User’s guide for more information. Citrix Secure Access collects product configuration and usage data to manage, measure and improve the service. To learn more, please visit https://docs.netscaler.com/en-us/netscaler-gateway/citrix-gateway-clients/tap-telemetry. | ⬛ Always included with parent EPM. |
| `citrix_secure_access_end_point_analysis` | 24.11.4.7.2503.0 | End Point Analysis Plugin — Citrix End Point Analysis is the Ubuntu Client for checking Endpoint criteria to Enterprise Network via NetScaler Gateway. Please access the NetScaler Gateway User's guide for more information. | 🔵 Included by default; remove if not required in your deployment. |

### Philips Speech Drivers

> Philips SpeechMike and dictation device drivers. Select the ICA or RDP variant depending on your remote-desktop protocol.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `PhilipsLibraries` | 13.3.5 | Libraries | ⬛ Always included with parent EPM. |
| `PhilipsCitrixDrivers` | 13.3.5 | Philips Speech Drivers for Citrix | 🔵 Included by default; remove if not required in your deployment. |
| `PhilipsRDPDrivers` | 13.3.5 | Philips Speech Drivers for RDP | ⬜ Requires `eluxrdp`, `PhilipsLibraries`. |

### Zoom Client for Linux

> Zoom Meetings native client. Select when meetings run directly on the thin client (not inside a virtual session).

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `zoomclient_base` | 6.6.10.5815 | Zoom Client base files — Programs and libraries of the Zoom Client for Linux Version 6.6.10.5815. | ⬛ Always included with parent EPM. |
| `zoomclient_cef` | 6.6.10.5815 | CEF files — Chromium Embedded Framework (CEF) library for the Zoom Client for Linux Version 6.6.10.5815. | ⬛ Always included with parent EPM. |
| `zoomclient_qt5` | 6.6.10.5815 | Qt5 files — Qt5 files for the Zoom Client for Linux Version 6.6.10.5815. | ⬛ Always included with parent EPM. |
| `zoomclient_translations` | 6.6.10.5815 | Zoom Client translation files — Translations for the Zoom Client for Linux Version 6.6.10.5815. | ⬛ Always included with parent EPM. |

### Zoom Vdi Plugin

> Zoom VDI optimization plug-in for media offload inside Citrix, Horizon, or AVD sessions. Requires the matching plug-in on the virtual desktop host.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `zoomvdi_base` | 6.5.12.26790 | Binaries for Zoom Vdi Plugin | ⬛ Always included with parent EPM. |
| `zoomvdi_ica` | 6.5.12.26790 | Citrix Workspace app support | 🔵 Included by default; remove if not required in your deployment. |
| `zoomvdi_clips` | 6.5.12.26790 | Clips feature for Zoom Vdi Plugin — Supplementary programs and libraries of the Zoom Vdi Plugin. | ⬜ Add when this specific feature is needed. |
| `zoomvdi_plugin_management` | 6.5.12.26790 | Management Tool for Zoom Vdi Plugin — Supplementary programs and libraries of the Zoom Vdi Plugin. | ⬜ Add when this specific feature is needed. |
| `zoomvdi_vmwareviewclient` | 6.5.12.26790 | Omnissa Horizon Client support — Omnissa Horizon Client (former VMware Horizon Client) support. | ⬜ Requires `pulseaudio`, `vmwareviewclient`. |

## Driver

Hardware drivers and device-support packages, including printers, scanners, display adapters, and wireless hardware.

### DisplayLink

> DisplayLink USB graphics driver. Include when thin clients use USB docking stations or USB-attached external displays.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `displaylink_bin` | 6.2.0.30.7.2603.0 | DisplayLink binaries — DisplayLink(R) USB Graphics Software for Ubuntu Linux | ⬛ Always included with parent EPM. |

### Print Environment (CUPS)

> CUPS-based printing environment. Mandatory components set up the scheduler and drivers. Add optional components for network printer auto-detection, LPD services, or non-PostScript driver support.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `baseprinter_cupsbackend` | 2.4.1.7.2603.0 | Backends — CUPS backends addressing the following output interfaces: usb, parallel, serial, lpd, ipp, ipps, http, https | ⬛ Always included with parent EPM. |
| `baseprinter_cupsbin` | 2.4.1.7.2603.0 | Programs and binaries — CUPS scheduler and corresponding programs | ⬛ Always included with parent EPM. |
| `baseprinter_cupsfilter` | 1.28.15.7.2601.0 | Filter — CUPS filters to convert to the following target formats: Postscript, HP (PCL), Epson (ESC/P) | ⬛ Always included with parent EPM. |
| `baseprinter_cupsfonts` | 20120503.7.2510.0 | Fonts — CUPS Fonts | ⬛ Always included with parent EPM. |
| `baseprinter_cupslib` | 2.4.1.7.2603.0 | Libraries — CUPS library/API to be used by applications | ⬛ Always included with parent EPM. |
| `baseprinter_cupsmodel` | 2.4.1.7.2603.0 | Printer drivers — Collection of CUPS printer drivers (PPD) | ⬛ Always included with parent EPM. |
| `baseprinter_cupslpd` | 2.4.1.7.2603.0 | LPD print service — CUPS LPD print service | 🔵 Included by default; remove if not required in your deployment. |
| `baseprinter_tcpdirect` | 7.2411.0 | TCPdirect print service — Receives print data from network and relays it directly to the interface (USB, LPT, COM) | 🔵 Included by default; remove if not required in your deployment. |
| `baseprinter_autodetect` | 1.28.15.7.2601.0 | Printer auto detection — Automaticaly detects printers on the local network and adds them to the list of available printers | ⬜ Requires `systemlibs_libavahi`, `systemlibs_libavahi_bin`, `systemlibs_activate_mdns` …. |
| `baseprinter_cupsadmin` | 2.4.1.7.2603.0 | Web administration interface — Easy to use web interface to monitor/administrate local printers. Use with the following URL: http://localhost:631 | ⬜ Add when this specific feature is needed. |
| `baseprinter_psfilter` | 5.3.3.7.2404.0 | Non PS printer support — This package includes a CUPS driver based on Gutenprint. | ⬜ Add when this specific feature is needed. |

### Scanner Environment (SANE)

> SANE scanner environment. Include when thin clients need to connect to local or network-attached scanners.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `sane_base` | 1.3.1.7.2509.0 | Programs and libraries — SANE programs and libraries | ⬛ Always included with parent EPM. |

### UEFI BIOS update daemon

> UEFI firmware update daemon (fwupd). Include when endpoints need to receive firmware updates via ELIAS or over the network.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `fwupdlibs` | 1.2.5.1.7.2409.0 | fwupdlibs — fwupd dependend libraries | ⬛ Always included with parent EPM. |
| `uefibootloader` | 1.2.2.3.7.2511.0 | UEFI boot loader — boot loader to chain-load signed boot loaders | ⬛ Always included with parent EPM. |
| `uefifwupdbase` | 1.9.16.7.2511.0 | Firmware update daemon — fwupd is a daemon to allow session software to update device firmware. | ⬛ Always included with parent EPM. |

### WLAN drivers

> WLAN drivers and firmware. Select the firmware FPM(s) that match the WLAN chipsets present in your hardware.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `wirelesstools` | 5.16.7.2603.0 | Configuration tools — Tools for manipulating Linux Wireless Extensions This package contains the Wireless tools, used to manipulate the Linux Wireless Extensions. The Wireless Extension is an interface allowing you to set Wireless LAN specific parameters and get the specific stats. Homepage: http://www.hpl.hp.com/personal/Jean_Tourrilhes/Linux/Tools.html | ⬛ Always included with parent EPM. |
| `wlaneluxintegration` | 7.2404.0 | eLux WLAN plugin — Provides WLAN plugin for ucsettings daemon | ⬛ Always included with parent EPM. |
| `wpa_supplicant` | 2.10.7.2509.0 | WPA supplicant — client support for WPA and WPA2 (IEEE 802.11i) WPA and WPA2 are methods for securing wireless networks, the former using IEEE 802.1X, and the latter using IEEE 802.11i. This software provides key negotiation with the WPA Authenticator, and controls association with IEEE 802.11i networks. Homepage: http://w1.fi/wpa_supplicant/ | ⬛ Always included with parent EPM. |
| `athwlanfirmware` | 20220329.7.2603.0 | Atheros firmware files — This package provides atheros firmware files. | 🔵 Included by default; remove if not required in your deployment. |
| `b43wlanfirmware` | 20220329.7.2603.0 | Broadcom firmware files — This package provides broadcom firmware files. | 🔵 Included by default; remove if not required in your deployment. |
| `intelwlanfirmware` | 20220329.7.2603.0 | Intel firmware files — This package provides iwlwifi firmware files. | 🔵 Included by default; remove if not required in your deployment. |
| `mrvlwlanfirmware` | 20220329.7.2603.0 | Marvell firmware files — This package provides marvell firmware files. | 🔵 Included by default; remove if not required in your deployment. |
| `tiwlanfirmware` | 20220329.7.2603.0 | Texas Instrument firmware files — This package provides Texas Instrument firmware files. | 🔵 Included by default; remove if not required in your deployment. |
| `wlanfirmware` | 20220329.7.2603.0 | General firmware files — This package provides firmware used by WLAN kernel drivers. | 🔵 Included by default; remove if not required in your deployment. |
| `bluetoothfirmware` | 20220329.7.2603.0 | Bluetooth firmware files — This package provides firmware files for Bluetooth. | ⬜ Add when this specific feature is needed. |

## Multimedia

Audio and video frameworks, codecs, and media libraries.

### Audio Libraries

> Core audio libraries. Pulled in as a dependency by PulseAudio and audio-enabled applications.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `libcdda` | 3.10.2.7.2603.0 | Cdda audio exctraction library — audio extraction tool for sampling CDs (library) | ⬜ Add when this specific feature is needed. |
| `libgsm` | 1.0.19.7.2404.0 | Shared libraries for GSM speech compressor — This package contains runtime shared libraries for libgsm, an implementation of the European GSM 06.10 provisional standard for full-rate speech transcoding, prI-ETS 300 036, which uses RPE/LTP (residual pulse excitation/long term prediction) coding at 13 kbit/s. | ⬜ Add when this specific feature is needed. |
| `libjack` | 0.125.0.7.2603.0 | JACK Audio Connection Kit — JACK is a low-latency sound server, allowing multiple applications to connect to one audio device, and to share audio between themselves. | ⬜ Add when this specific feature is needed. |
| `libmp3` | 1.29.3.7.2603.0 | mp3 codec runtime library — MP3 is a coding format for digital audio. Originally defined as the third audio format of the MPEG-1 standard, it was retained and further extendeddefining additional bit-rates and support for more audio channels as the third audio format of the subsequent MPEG-2 standard. A third version, known as MPEG 2.5 extended to better support lower bit rates is commonly implemented, but is not a recognized standard. | ⬜ Add when this specific feature is needed. |
| `libopus` | 1.3.1.7.2404.0 | Opus codec runtime library — Opus is a lossy audio coding format designed to efficiently code speech and general audio in a single format, while remaining low-latency enough for real-time interactive communication and low-complexity enough for low-end embedded processors. | ⬜ Add when this specific feature is needed. |
| `libsamplerate` | 0.2.2.7.2603.0 | sample rate — An audio Sample Rate Conversion library. | ⬜ Add when this specific feature is needed. |
| `libtag1` | 1.11.1.7.2603.0 | audio meta-data library — TagLib is a library for reading and editing the meta-data of several popular audio formats. Currently it supports both ID3v1 and ID3v2 for MP3 files, Ogg Vorbis comments and ID3 tags and Vorbis comments in FLAC, MPC, Speex, WavPack TrueAudio, WAV, AIFF, MP4 and ASF files. http://developer.kde.org/~wheeler/taglib.html | ⬜ Add when this specific feature is needed. |
| `libvisual` | 0.4.0.7.2603.0 | Audio visualization framework — Libvisual is a generic visualization framework that allows applications to easily access and manage visualization plugins. Audio visualization is the process of making pretty moving images that are correlated in some way to the audio currently being played by a media player. Most audio visualization is tied to a specific application or media player, making it difficult to share code. Libvisual allows applications to use existing visualization plugins written for the libvisual framework. | ⬜ Add when this specific feature is needed. |
| `libwavpack` | 5.4.0.7.2603.0 | audio codec (lossy and lossless) library — WavPack is a completely open audio compression format providing lossless, high-quality lossy, and a unique hybrid compression mode. Although the technology is loosely based on previous versions of WavPack, the new version 4 format has been designed from the ground up to offer unparalleled performance and functionality. http://www.wavpack.com | ⬜ Add when this specific feature is needed. |
| `libwebrtc_audio_processing` | 0.3.1.7.2404.0 | AudioProcessing module from the WebRTC project | ⬜ Add when this specific feature is needed. |

### Fluendo System-wide Codec Pack

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `fluendosw_integration` | 7.2509.0 | Codec Integration — Fluendo codec integration and licensing | ⬛ Always included with parent EPM. |
| `fluendosw_gst1_0_codecs` | 20250822.7.2509.0 | Codecs for GStreamer 1.0 — GStreamer 1.0 support: audio codecs (AAC, LPCM, MP3, WMA) and video codecs (H.264/AVC, MPEG4 Part 2, WMV) and demuxer (Windows Media ASF) | ⬜ Requires `gstreamer1_0`. |
| `fluendosw_openh264` | 1.8.0.7.2509.0 | Codec for WebRTC — Fluendo openH264 codec | ⬜ Add when this specific feature is needed. |

### GStreamer 1.0 - multimedia framework

> GStreamer 1.0 multimedia framework. Required by applications that use GStreamer for media playback or processing.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `gstreamer1_0_base` | 1.20.3.7.2510.0 | Core GStreamer libraries and elements — GStreamer is a streaming media framework, based on graphs of filters which operate on media data. Applications using this library can do anything from real-time sound processing to playing videos, and just about anything else media-related. Its plugin-based architecture means that new data types or processing capabilities can be added simply by installing new plug-ins. This package contains the core library and elements. | ⬛ Always included with parent EPM. |
| `gstreamer1_0_pluginsbase` | 1.20.1.7.2510.0 | Base plugins — GStreamer is a streaming media framework, based on graphs of filters which operate on media data. Applications using this library can do anything from real-time sound processing to playing videos, and just about anything else media-related. Its plugin-based architecture means that new data types or processing capabilities can be added simply by installing new plug-ins. This package contains the GStreamer plugins from the "base" set, an essential exemplary set of elements. | ⬛ Always included with parent EPM. |
| `gstreamer1_0_pluginsgood` | 1.20.3.7.2510.0 | Plugins with good code and licensing — GStreamer is a streaming media framework, based on graphs of filters which operate on media data. Applications using this library can do anything from real-time sound processing to playing videos, and just about anything else media-related. Its plugin-based architecture means that new data types or processing capabilities can be added simply by installing new plug-ins. This package contains the GStreamer plugins from the "good" set, a set of good-quality plug-ins under the LGPL license. | ⬛ Always included with parent EPM. |
| `gstreamer1_0_openh264` | 1.20.3.7.2404.0 | OpenH264 and Codec Parsers plugins for GStreamer — OpenH264 and Codec Parsers plugins for GStreamer. videoparsersbad (contains h264parse and others) | ⬜ Requires `libopenh264`. |
| `gstreamer1_0_sdphls` | 1.20.3.7.2404.0 | HLS SDP demux — HTTP Live Streaming demuxer, SDP session setup | ⬜ Add when this specific feature is needed. |
| `gstreamer1_0_vaapi` | 1.20.1.7.2404.0 | VA-API plugins for GStreamer | ⬜ Requires `xorg_libraries`, `hwaccdrivers`, `gstreamer1_0_openh264`. |
| `gstreamer1_0_webrtc` | 1.20.3.7.2404.0 | Web Real-Time Communication | ⬜ Requires `desktop_environment`, `audiolibs`, `libwebrtc_audio_processing` …. |

### Video libraries

> Video codec libraries. Required by applications using hardware-accelerated video decoding or encoding.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `libavc1394` | 0.5.4.0.7.2404.0 | control IEEE 1394 audio/video — libavc1394 is a programming interface for the 1394 Trade Association AV/C (Audio/Video Control) Digital Interface Command Set. It allows you to remote control camcorders and similar devices connected to your computer via an IEEE 1394 (aka Firewire) link. | ⬜ Add when this specific feature is needed. |
| `libdv4` | 1.0.0.14.0.7.2404.0 | library for DV format digital video — The Quasar DV Codec (libdv) is a software decoder for DV format video, as defined by the IEC 61834 and SMPTE 314M standards. DV is the encoding format used by consumer-grade digital camcorders.http://libdv.sourceforge.net | ⬜ Add when this specific feature is needed. |
| `libffmpeg` | 4.4.2.7.2507.0 | FFmpeg library for audio and video — FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created. It supports the most obscure ancient formats up to the cutting edge. | ⬜ Requires `libvpx`, `libtheora`, `systemlibs` …. |
| `libffmpeg_format` | 4.4.1.7.2509.0 | FFmpeg library with (de)muxers for multimedia containers — FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created. It supports the most obscure ancient formats up to the cutting edge. This library provides a generic framework for multiplexing and demultiplexing (muxing and demuxing) audio, video and subtitle streams. It encompasses multiple muxers and demuxers for multimedia container formats. It also supports several input and output protocols to access a media resource. | ⬜ Requires `libffmpeg`, `systemlibs`, `libpgm` …. |
| `libopenh264` | 2.2.0.7.2404.0 | OpenH264 Video Codec (shared library) — OpenH264 Video Codec | ⬜ Add when this specific feature is needed. |
| `libshout3` | 2.4.5.0.7.2404.0 | MP3/Ogg Vorbis broadcast library — A library for communicating with and sending data to Icecast and Icecast 2 streaming audio servers. It handles the socket connection, the timing of the data transmission, and prevents bad data from getting to the server.http://www.icecast.org/ | ⬜ Add when this specific feature is needed. |
| `libtheora` | 1.1.1.0.7.2404.0 | Theora video compression codec — Theora is an open video codec being developed by the Xiph.org Foundation as part of their Ogg project. Theora is originally derived from On2's VP3 codec, and has improved on it significantly with the merging of code from the Thusnelda branch. | ⬜ Add when this specific feature is needed. |
| `libvpx` | 1.11.0.7.2509.0 | VP8 and VP9 video codec (shared library) — VP8 and VP9 video codec. homepage: http://www.webmproject.org | ⬜ Add when this specific feature is needed. |
| `v4l_utils` | 1.22.1.0.7.2404.0 | V4L Utils — The V4L API is essentially a kernel interface for analog video capture and output drivers. | ⬜ Add when this specific feature is needed. |

## Network

Network services, protocols, and connectivity components.

### Dynamic Proxy update

> WPAD/PAC-based dynamic proxy configuration. Include when proxy settings are distributed automatically via network discovery.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `dynamicproxybase` | 7.2601.0 | Dynamic Proxy update service | ⬛ Always included with parent EPM. |

### Mobile Internet Drivers

> Mobile broadband (WWAN/LTE) drivers. Include when thin clients use built-in or USB mobile broadband adapters.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `wwaneluxintegration` | 7.2404.0 | eLux WWAN plugin — Provides WWAN plugin for ucsettings daemon. | ⬛ Always included with parent EPM. |
| `wwantools` | 1.20.0.7.2603.0 | Configuration tools — ModemManager daemon to control mobile broadband devices and connections. | ⬛ Always included with parent EPM. |
| `wwan_modemmanager_blacklist` | 7.2404.0 | ModemManager hardware blacklist — Blacklist to prevent ModemManager from probing particular devices | 🔵 Included by default; remove if not required in your deployment. |
| `wwan_force_apn` | 7.2404.0 | Force setting Access Point Name (APN) — Allow setting Access Point Name (APN) in case ModemManager doesn't handle this correctly | ⬜ Add when this specific feature is needed. |

### Network Access Control

> IEEE 802.1X wired and wireless NAC supplicant. Required in environments where port-based access control is enforced.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `networkaccesscontrol_base` | 7.2601.0 | Network Access Control Base — Enables 802.1X functionality. | ⬛ Always included with parent EPM. |
| `scep` | 0.10.0.0.7.2601.0 | SCEP Simple Certificate Enrollment Protocol — Support certificate provisioning and enrollment using Simple Certificate Enrollment Protocol (SCEP). | 🔵 Included by default; remove if not required in your deployment. |
| `est` | 3.2.0.7.2601.0 | EST Enrollment over Secure Transport — Support certificate provisioning and enrollment using Enrollment over Secure Transport (EST) described in RFC 7030. | ⬜ Add when this specific feature is needed. |

### Network drive share

> Network share mounting (SMB/NFS/WebDAV). Include when thin clients need to access shared file storage.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `automount` | 5.1.8.7.2404.0 | Automount for AutoFSv4 — kernel-based automounter for Linux Autofs controls the operation of the automount daemons. The automount daemons automatically mount filesystems when they are used and unmount them after a period of inactivity. This is done based on a set of pre-configured maps. http://www.kernel.org/pub/linux/daemons/autofs/v5 | ⬛ Always included with parent EPM. |
| `cifsmount` | 6.14.7.2509.0 | Tools to mount Windows shares — The SMB/CIFS protocol provides support for cross-platform file sharing with Microsoft Windows, OS X, and other Unix systems. This package provides utilities for managing mounts of CIFS network filesystems. | ⬛ Always included with parent EPM. |
| `keyutils` | 1.6.1.7.2509.0 | Linux Key Management Utilities — Keyutils is a set of utilities for managing the key retention facility in the kernel, which can be used by filesystems, block devices and more to gain and retain the authorization and encryption keys required to perform secure mounts. | ⬜ Add when this specific feature is needed. |
| `nfsclient` | 2.6.1.7.2603.0 | NFS Support — NFS client for automounter | ⬜ Add when this specific feature is needed. |

### Squid Update Proxy

> Squid caching proxy update service. Include when the thin client acts as a local update proxy for other endpoints.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `squid_server` | 5.9.7.2601.0 | Squid Update Proxy — Full featured Web Proxy cache (HTTP proxy) | ⬛ Always included with parent EPM. |

## Powermanagement

Battery optimization and power-management utilities, primarily relevant for notebook thin clients.

### TLP battery life optimization

> TLP battery life optimization. Recommended for laptop or notebook thin-client hardware to extend battery runtime.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `tlp_base` | 1.8.0.7.2511.0 | TLP base files — TLP offers advanced battery power management for Linux | ⬛ Always included with parent EPM. |
| `tlp_configuration` | 1.8.0.7.2511.0 | TLP device specific configuration — Advanced configuration for specific devices | 🔵 Included by default; remove if not required in your deployment. |

## Security

Certificates, smart card middleware, authentication modules, and network access control.

### CA certificates

> Required when connecting to services signed by public CAs. Mandatory if your environment uses TLS with publicly trusted certificates.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `ca_certificates_base` | 20240203.7.2501.0 | Certificate files — Version: 20211016. Contains the certificate authorities shipped with Mozilla's browser to allow SSL-based applications to check for the authenticity of SSL connections. Please note that Unicon can neither confirm nor deny whether the certificate authorities whose certificates are included in this package have in any way been audited for trustworthiness or RFC 3647 compliance. Full responsibility to assess them belongs to the local system administrator. | ⬛ Always included with parent EPM. |

### Certificado digital FNMT

> FNMT digital certificate support for Spanish National Identity Document (DNIe). Required only in Spanish public-sector deployments.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `fnmtdnielibpkcs11` | 2.0.0.7.2601.0 | FNMT DNIe PKCS11 middleware — fnmtdnie PKCS11 middleware | ⬛ Always included with parent EPM. |

### Cisco Secure Client

> Cisco Secure Client (formerly AnyConnect) VPN. Include when thin clients connect to the corporate network via Cisco VPN.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cisco_secure_client_vpn` | 5.1.10.233.7.2510.0 | Cisco Secure Client VPN base installation — Cisco Secure Client VPN software | ⬛ Always included with parent EPM. |
| `cisco_secure_client_dart` | 5.1.10.233.7.2510.0 | Cisco Secure Client DART — Cisco Secure Client Diagnostic And Reporting Tool (DART). Start by calling 'dart'. By default DART writes into the Desktop folder. Either configure this folder as writable in Scout or select 'Custom' in DART to be able to select a writable folder. | ⬜ Add when this specific feature is needed. |
| `cisco_secure_client_elux_starter` | 5.1.10.233.7.2510.0 | eLux Cisco Secure Client Starter — Provide command line tool /usr/bin/elux-cisco-secure-client-starter to start the vpnui. Can be started from a custom application. | ⬜ Add when this specific feature is needed. |

### Cryptovision sc/interface PKCS11

> Cryptovision sc/interface PKCS#11 middleware. Select when using Cryptovision-managed smart cards for authentication.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cryptovisionclient_libpkcs11` | 8.1.0.718 | Cryptovision sc/interface PKCS11 library — PKCS#11 library for sc/interface middleware from cv cryptovision GmbH | ⬛ Always included with parent EPM. |
| `cryptovisionclient_binpkcs11` | 8.1.0.718 | Cryptovision sc/interface binary files — PKCS#11 binaries for sc/interface middleware from cv cryptovision GmbH | ⬜ Requires `gtk2`. |

### Firewall support

> Host-based firewall (iptables/nftables). Recommended for any deployment requiring inbound traffic restriction on the endpoint.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `firewall_base` | 1.0.2.7.2404.0 | Firewall nftables programs and libraries — Programs and libraries for a local firewall based on nftables. | ⬛ Always included with parent EPM. |
| `firewall_elux` | 7.2404.0 | eLux firewall plugin — eLux firewall plugin for ucsettings daemon. | ⬛ Always included with parent EPM. |
| `firewall_ipset` | 7.2507.0 | ipset userland — administration tool for kernel IP sets | ⬜ Add when this specific feature is needed. |
| `firewall_iptables_comp` | 7.2404.0 | Firewall iptables compatibility services — Systemd services for iptables compatibility. | ⬜ Add when this specific feature is needed. |
| `firewall_strict_policy` | 7.2404.0 | Strict firewall policy — Enables strict firewall policy if no firewall configuration (nftables.conf) is present. The strict firewall policy without a separate firewall configuration only allows communication between the Scout Enterprise Server and the eLux client via the management protocol (port 22125). | ⬜ Add when this specific feature is needed. |

### Open LDAP

> OpenLDAP client libraries. Required when authentication or printing configuration relies on LDAP directory lookups.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `cyrussasl_gssapi` | 2.1.27.7.2404.0 | Pluggable Authentication Modules for SASL (GSSAPI) — This is the Cyrus SASL API implementation, version 2.1. See package libsasl2-2 and RFC 2222 for more information. This package provides the GSSAPI plugin, compiled with the Heimdal Kerberos 5 library. | ⬛ Always included with parent EPM. |
| `openldapbase` | 2.5.20.7.2603.0 | Base files, OpenLDAP utilities — This package provides utilities from the OpenLDAP (Lightweight Directory Access Protocol) package. These utilities can access a local or remote LDAP server and contain all the client programs required to access LDAP servers. | ⬛ Always included with parent EPM. |

### PCSC Lite

> PC/SC Lite smart card middleware. Prerequisite for any smart card–based authentication or PKI token usage.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `pcsclite_base` | 2.3.3.7.2601.0 | PCSC Lite SmartCard Library — PCSC Lite SmartCards Interface Licence: BSD licenses | ⬛ Always included with parent EPM. |
| `ccid` | 1.6.2.7.2509.0 | Generic CCID reader — Gemalto Gem e-Seal Pro, Gemalto GemPC Twin, Gemalto GemPC Key, Gemalto GemPC Pinpad, Gemalto GemCore POS Pro, Gemalto GemCore SIM Pro, Gemalto GemPC Express, Gemalto GemPC433 SL, Gemalto Prox-DU, Gemalto Prox-SU, Gemalto Hybrid Smartcard Reader, Smart Enterprise Guardian, Verisign Secure Token, VeriSign Secure Storage Token, Gemalto PDT, SCM SCR 331-DI, SCM SCR 333, SCM SCR 335, SCM SCR 3310, SCM SCR 3320, SCM SCR 3340 ExpressCard54, SCM SCR 3310 NTTCom, Axalto Reflex USB v3, SCM SCR 3311, SCM SCR 331-DI NTTCom, SCM SDI 010, SCM SCR 331, SCM SCR 355, SCM SPR 532, OmniKey CardMan 1021, OmniKey CardMan 3121, OmniKey CardMan 3621, OmniKey CardMan 3821, OmniKey CardMan 4321, OmniKey CardMan 5121, OmniKey CardMan 5125, OmniKey CardMan 5321, OmniKey CardMan 6121, Smart Card Reader, Teo by Xiring, C3PO LTC31, C3PO TLTC2USB, C3PO LTC32 USBv2 with keyboard support, C3PO KBR36, C3PO LTC32, C3PO LTC36, C3PO TLTC2USB, ActivCard USB Reader 3.0, Activkey Sim, Silitek SK-3105, Dell keyboard SK-3106, Dell smart card reader keyboard, Cherry XX33, Cherry XX44, Cherry ST1044U, Cherry SmartTerminal ST-2XXX, Cherry SmartBoard XX1X, Cherry SmartTerminal XX1X, Cherry SmartTerminal XX7X, ACS ACR 38U-CCID, ACS ACR122U PICC Interface, O2 Micro Oz776, O2 Micro Oz776, KOBIL KAAN Base, KOBIL KAAN Advanced, KOBIL Smart Token, KOBIL mIDentity 4smart, KOBIL mIDentity 4smart AES, KOBIL mIDentity visual, KOBIL mIDentity fullsize, KOBIL mIDentity 4smart fullsize AES, KOBIL KAAN SIM III, KOBIL EMV CAP - SecOVID Reader III, KOBIL mIDentity M, KOBIL mIDentity XL, Eutron Digipass 860, Eutron SIM Pocket Combo, Eutron Smart Pocket, Eutron CryptoIdentity, Eutron CryptoIdentity, Athena ASE IIIe, Athena ASEDrive IIIe KB, SmartEpad, Winbond, HP USB Smart Card Keyboard, HP USB Smartcard Reader, HP MFP Smart Card Reader, id3 CL1356T5, id3 CL1356A HID, Alcor Micro AU9520, RSA SecurID, Fujitsu Siemens SmartCard Keyboard USB 2A, Fujitsu Siemens SmartCard USB 2A, Sitecom USB simcard reader MD-010, SchlumbergerSema Cyberflex Access, Philips JCOP41V221, Philips SmartMX, GnD CardToken 350, GnD CardToken 550, Lenovo Integrated Smart Card Reader, Charismathics token, Blutronics Bludrive II CCID, Covadis Alya, Covadis Vega, Covadis Auriga, Vasco DP905, Vasco DIGIPASS KEY 860, Vasco DIGIPASS KEY 200, Vasco DP855, Vasco DP865, Validy TokenA sl vt, SpringCard CrazyWriter, SpringCard CSB6 Basic, SpringCard CSB6 Secure, SpringCard CSB6 Ultimate, SpringCard EasyFinger Standard, SpringCard EasyFinger Ultimate, SpringCard Prox'N'Roll, OCS ID-One Cosmo Card, Aladdin eToken PRO USB 72K Java, Atmel AT91SO, Atmel AT98SC032CT, Atmel AT91SC192192CT-USB ICCD, Atmel AT90SCR100, Atmel AT90SCR050, Atmel VaultIC420, Atmel VaultIC440, Atmel VaultIC460, KONA USB SmartCard, Xiring XI-SIGN USB V2, VMware Virtual USB CCID, MSI StarReader SMART, Dectel CI692, Realtek, Aktiv Rutoken Magistra, Aktiv Rutoken ECP, TianYu CCID SmartKey, Tianyu Smart Card Reader, Precise 250 MC, Precise 200 MC, Raritan D2CIM-DVUSB VM/CCID, Feitian SCR301, Softforum XecureHSM, Neowave Weneo, Neowave Weneo, Synnix STD200, Panasonic USB Smart Card Reader 7A-Smart, Todos AGM2 CCID, Todos CX00, Broadcom 5880, Broadcom 5880, Broadcom 5880, Ask CPL108, German Privacy Foundation Crypto Stick v1.2, GoldKey PIV Token, Kingtrust Multi-Reader, ActivCard USB Reader 2.0, C3PO LTC31, SmartCase KB SCR eSIG Licence: LGPL 2.1 | 🔵 Included by default; remove if not required in your deployment. |
| `cyberjack` | 3.99.5.14.7.2404.0 | REINER SCT — ReinerSCT cyberjack USB chipcard reader build from: pcsc-cyberjack-3.99.5final.SP14 Suported Reades: pp_a, ecom_a, pp_a2, RFID standard, RFID komfort and compact http://www.reiner-sct.de/ | ⬜ Add when this specific feature is needed. |
| `omnikey_ccid` | 4.2.8.7.2507.0 | OMNIKEY CCID — http://www.hidglobal.com Supports: OMNIKEY models 3x21,512x and 532x | ⬜ Add when this specific feature is needed. |
| `pcsc_tools` | 1.6.0.7.2404.0 | PCSC tools — Tools to check if pcsc and ccid are working. Licence: GPL 2 | ⬜ Add when this specific feature is needed. |
| `scm_ccid` | 5.0.35.7.2507.0 | SCM ccid package — Supports CHIPDRIVE pinpad pro/ dual pro/ desktop pro /micro pro /mini /Secure Stick /MyKey Stick /Sim Card Stick /ExpressCard54 /Smartfold /CLOUD 4xx0 F /CLOUD 2xx0 F/R (SPR532/ SDI010/ SCR3311 /SCR335 /SCR3310 /SCR3320 /SCR3340/ SCR3500/ SCT3511) : | ⬜ Add when this specific feature is needed. |

### Security Libraries

> Core security libraries (OpenSSL, GnuTLS, libsodium). Pulled in automatically as a dependency by most networked applications.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `heimdallibs` | 7.7.0.0.7.2404.0 | Heimdal libraries - Kerberos 5 — Kerberos 5 implementation from KTH | ⬛ Always included with parent EPM. |
| `kerberos_config` | 7.2404.0 | Kerberos 5 configuration | ⬛ Always included with parent EPM. |
| `heimdalbin` | 7.7.0.0.7.2404.0 | Heimdal binaries — These heimdal programs are mostly used for troubleshooting. | ⬜ Requires `libkrb5_so_26`. |

### User authentication modules

> User authentication framework supporting Kerberos, smart card, LDAP, and biometric logon modules. Select the modules relevant to your authentication infrastructure.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `userauthbase` | 7.2603.0 | Base files — Base modules for authentication | ⬛ Always included with parent EPM. |
| `userauthldap` | 4.11.0.7.2511.0 | LDAP or ADS authentication module — Module for authentication against ActiveDirectoy (kerberos) or LDAP pam_ldap: based on Version 184 by Luke Howard from PADL Software Pty Ltd, pamldap-support@padl.com, http://www.padl.com/ pam_krb5: Copyright (c) 2005, 2006, 2007 Russ Allbery <rra@debian.org> Copyright (c) 2005 Andres Salomon <dilinger@debian.org> Copyright (c) Frank Cusack, 1999-2000. fcusack@fcusack.com All rights reserved For complete copyright and license information, see: http://www.eyrie.org/~eagle/software/pam-krb5/license.html | ⬛ Always included with parent EPM. |
| `libfido2` | 1.10.0.7.2511.0 | library for generating and verifying FIDO 2.0 objects — A library for communicating with a FIDO device over USB, and for verifying attestation and assertion signatures. FIDO U2F (CTAP 1) and FIDO 2.0 (CTAP 2) are supported. | ⬜ Add when this specific feature is needed. |
| `userauth_opensc_pkcs11` | 3.1.6.7.2601.0 | OpenSC PKCS11 middleware | ⬜ Requires `userauthpkcs11`, `pcsc_lite`. |
| `userauthpkcs11` | 3.1.6.7.2603.0 | X.509 certificate authentication module — OpenSC provides a set of libraries and utilities to work with smart cards. Its main focus is on cards that support cryptographic operations, and facilitate their use in security applications such as authentication, mail encryption and digital signatures. GPL. | ⬜ Add when this specific feature is needed. |

## System

Core operating system components, the desktop environment, display server, and kernel.

### BaseOS eLux

> The eLux OS foundation. All mandatory components are required. Optional components extend capabilities — enable only what your deployment needs.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `alsa` | 1.2.9.7.2601.0 | Advanced Linux Sound Architecture — Enables sound under eLux. It includes ALSA basic utilities. | ⬛ Always included with parent EPM. |
| `basesystem` | 7.2603.0 | System binaries and libraries — Some additional system binaries and libraries includeing fuse and ntfs. | ⬛ Always included with parent EPM. |
| `clevistpm2` | 18.7.2603.0 | Clevis TPM2 support — Clevis is a plugable framework for automated decryption. It can be used to provide automated decryption of data or even automated unlocking of LUKS volumes. | ⬛ Always included with parent EPM. |
| `dbus` | 1.12.20.7.2603.0 | D-Bus — simple interprocess messaging system (daemon and utilities) | ⬛ Always included with parent EPM. |
| `install` | 7.2603.0 | Core installer — Proceed an update of the eLux inner core components | ⬛ Always included with parent EPM. |
| `libatomic` | 12.3.0.7.2510.0 | libatomic — support library providing __atomic built-in functions | ⬛ Always included with parent EPM. |
| `libcpp1` | 19.1.6.7.2505.0 | LLVM C++ Standard library | ⬛ Always included with parent EPM. |
| `libncurses` | 6.3.7.2503.0 | libncurses | ⬛ Always included with parent EPM. |
| `locales` | 2.35.7.2603.0 | Language locales — System locales. | ⬛ Always included with parent EPM. |
| `minsystem` | 7.2603.0 | Minimal Linux system — Provides minimal set of system binaries and libraries. | ⬛ Always included with parent EPM. |
| `openvpn` | 2.5.11.7.2505.0 | OpenVPN — OpenVPN is an application to securely tunnel IP networks over a single UDP or TCP port. It can be used to access remote sites, make secure point-to-point connections, enhance wireless security, etc. | ⬛ Always included with parent EPM. |
| `pam` | 1.4.0.7.2509.0 | Linux-PAM — Pluggable Authentication Modules (PAM) is a flexible mechanism for authenticating users. | ⬛ Always included with parent EPM. |
| `plymouth` | 0.9.5.7.2603.0 | Plymouth splash screen — Boot splash and boot logger | ⬛ Always included with parent EPM. |
| `timezone` | 7.2509.0 | Timezone files and tools — Provides timezone files and tools. | ⬛ Always included with parent EPM. |
| `udev` | 249.11.7.2603.0 | udev — udev allows Linux users to have a dynamic /dev directory and it provides the ability to have persistent device names. | ⬛ Always included with parent EPM. |
| `partition_encryption` | 7.2503.0 | Partition encryption — Enables a higher security level by encrypting the eLux system partition and setup partition | 🔵 Included by default; remove if not required in your deployment. |
| `baseos_coredump` | 7.2511.0 | Enable coredumps | ⬜ Add when this specific feature is needed. |
| `baseos_persistent_home` | 7.2603.0 | Persistent Home — Enables persistent directories for applications. | ⬜ Add when this specific feature is needed. |
| `libgomp1` | 12.3.0.7.2510.0 | GCC OpenMP (GOMP) support library — GOMP is an implementation of OpenMP for the C, C++, and Fortran compilers in the GNU Compiler Collection. | ⬜ Add when this specific feature is needed. |
| `resolved` | 249.11.7.2511.0 | systemd-resolved — systemd-resolved is a system service that provides network name resolution to local applications. It implements a caching and validating DNS/DNSSEC stub resolver, as well as an LLMNR and MulticastDNS resolver and responder. | ⬜ Add when this specific feature is needed. |
| `xinetd` | 2.3.15.3.7.2503.0 | eXtended InterNET Daemon — xinetd is a powerful replacement for the inetd port mapper | ⬜ Add when this specific feature is needed. |

### Bluetooth support

> Enable Bluetooth support when thin clients need to pair Bluetooth peripherals such as headsets, keyboards, or mice.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `bluezeluxintegration` | 1.0.3.7.2404.0 | eLux bluetooth plugin — Provides bluetooth plugin for ucsettings daemon | ⬛ Always included with parent EPM. |
| `blueztools` | 5.64.7.2601.0 | Bluetooth tools — BlueZ binaries and libraries | ⬛ Always included with parent EPM. |

### Desktop Environment

> Graphical desktop environment base. Required for all deployments with a local GUI.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `dconf` | 0.40.0.7.2510.0 | DCONF - Configuration database system — Dconf is a low-level configuration system and settings management. | ⬛ Always included with parent EPM. |
| `desktop_base` | 1.26.0.7.2603.0 | Desktop components — MATE environment and core components including file explorer (caja) and window manager (marco) | ⬛ Always included with parent EPM. |
| `glib` | 2.72.4.7.2603.0 | GLib - Utility library — GLib is a general-purpose utility library, which provides many useful data types, macros, type conversions, string utilities, file utilities, a mainloop abstraction, and so on. http://www.gtk.org | ⬛ Always included with parent EPM. |
| `gstreamer_runtime` | 1.20.1.7.2510.0 | Streaming media framework — gstreamer - base files of the modular streaming media framework | ⬛ Always included with parent EPM. |
| `gtk3` | 3.24.33.7.2510.0 | GTK+3 - GIMP ToolKit — GTK+ is a multi-platform toolkit for creating graphical user interfaces. Offering a complete set of widgets, GTK+ is suitable for projects ranging from small one-off tools to complete application suites. http://www.gtk.org | ⬛ Always included with parent EPM. |
| `lang_en` | 1.26.0.7.2603.0 | English language pack | ⬛ Always included with parent EPM. |
| `powermanager` | 0.99.17.7.2509.0 | Power manager — Adds power management functionality to the desktop. On devices with a battery a battery indicator is shown. On devices with a lid the screen is turned off when the lid is closed. | ⬛ Always included with parent EPM. |
| `webkit2gtk` | 2.46.5.7.2509.0 | WebKitGTK (API 4.1) — Web content engine library for GTK+ WebKit is a web content engine, derived from KHTML and KJS from KDE, and used primarily in Apple's Safari browser. It is made to be embedded in other applications, such as mail readers, or web browsers. It is able to display content such as HTML, SVG, XML, and others. It also supports DOM, XMLHttpRequest, XSLT, CSS, JavaScript/ECMAScript and more. WebKit2 is an API layer for WebKit designed from the ground up to support a split process model, where the web content lives in a separate process from the application UI. This build comes from the GTK+ port of WebKit (API version 4.1). This is the library for embedding in GTK+ applications. | ⬛ Always included with parent EPM. |
| `calc` | 2.1.4.7.2510.0 | Calculator — mate-calc is a powerful graphical calculator with financial, logical and scientific modes. It uses a multiple precision package to do its arithmetic to give a high degree of accuracy. Homepage: http://www.mate-desktop.org/ | ⬜ Add when this specific feature is needed. |
| `dconfeditor` | 3.38.3.7.2509.0 | Dconf editor — Simple configuration storage system - utilities DConf is a low-level key/value database designed for storing desktop environment settings. http://mate-desktop.org | ⬜ Requires `gtk3`. |
| `desktop_environment_file_manager` | 1.26.0.7.2509.0 | File manager program — Provides caja. Caja is the official file manager for the MATE desktop. It allows one to browse directories, preview files and launch applications associated with them. It is also responsible for handling the icons on the MATE desktop. It works on local and remote filesystems. | ⬜ Add when this specific feature is needed. |
| `desktop_environment_gnome_keyring` | 40.0.7.2601.0 | GNOME keyring — Provides the GNOME keyring | ⬜ Add when this specific feature is needed. |
| `desktop_environment_system_monitor` | 1.26.0.7.2509.0 | System monitor program — Provides mate-system-monitor. MATE system monitor allows you to graphically view and manipulate the running processes on your system. It also provides an overview of available resources such as CPU and memory. | ⬜ Add when this specific feature is needed. |
| `desktop_environment_terminal` | 1.26.0.7.2509.0 | Terminal programs — Provides xterm and mate-terminal | ⬜ Add when this specific feature is needed. |
| `document_viewer` | 1.26.0.7.2509.0 | Document viewer — atril is a simple multi-page document viewer. It can display and print PostScript (PS), Encapsulated PostScript (EPS), DJVU, DVI and Portable Document Format (PDF) files. When supported by the document, it also allows searching for text, copying text to the clipboard, hypertext navigation, and table-of-contents bookmarks. Homepage: http://www.mate-desktop.org/ | ⬜ Requires `libpoppler`, `webkit2gtk40`. |
| `gir_libs` | 7.2510.0 | gir1.2 libs — GObject introspection is a middleware layer between C libraries (using GObject) and language bindings. | ⬜ Add when this specific feature is needed. |
| `gtk2` | 2.24.33.7.2509.0 | GTK+2 - GIMP ToolKit — GTK+ is a multi-platform toolkit for creating graphical user interfaces. Offering a complete set of widgets, GTK+ is suitable for projects ranging from small one-off tools to complete application suites.^?http://www.gtk.org | ⬜ Add when this specific feature is needed. |
| `gvfs` | 1.48.2.7.2601.0 | GVFS - Virtual filesystem — GVFS is a userspace virtual filesystem where mounts run as separate processes which you talk to via D-Bus. It also contains a gio module that seamlessly adds gvfs support to all applications using the gio API. It also supports exposing the gvfs mounts to non-gio applications using fuse. http://wiki.gnome.org/gvfs | ⬜ Requires `systemlibs_libavahi`. |
| `image_viewer` | 1.26.0.7.2509.0 | Image viewer — eom or the Eye of MATE is a simple graphics viewer for the MATE desktop which uses the gdk-pixbuf library. It can deal with large images, and zoom and scroll with constant memory usage. Its goals are simplicity and standards compliance. Homepage: http://www.mate-desktop.org/ | ⬜ Requires `libpeas`. |
| `iso_codes` | 4.9.0.7.2509.0 | ISO language, territory, currency, script codes and their translations (de, en, es, fr) — ISO language, territory, currency, script codes and their translations | ⬜ Add when this specific feature is needed. |
| `lang_de` | 1.26.0.7.2603.0 | German language pack | ⬜ Add when this specific feature is needed. |
| `lang_es` | 1.26.0.7.2603.0 | Spanish language pack | ⬜ Add when this specific feature is needed. |
| `lang_fr` | 1.26.0.7.2603.0 | French language pack | ⬜ Add when this specific feature is needed. |
| `lang_tr` | 1.26.0.7.2603.0 | Turkish language pack | ⬜ Add when this specific feature is needed. |
| `libpeas` | 1.32.0.7.2509.0 | Application plugin library — libpeas is a library that allows applications to support plugins. | ⬜ Requires `glib`, `gtk3`. |
| `libqt5` | 5.15.3.7.2509.0 | Qt 5 — Qt is a cross-platform C++ application framework. Qt's primary feature is its rich set of widgets that provide standard GUI functionality. | ⬜ Requires `systemlibs`, `libminizip1`, `libevent` …. |
| `screenshot` | 1.26.0.7.2509.0 | Screenshot utility — Allows to take screenshots with <Shift>Print for fullscreen and <Shift><Alt>Print for to current window. | ⬜ Add when this specific feature is needed. |
| `text_editor` | 1.26.0.7.2509.0 | Text editor — pluma is a text editor which supports most standard editor features, extending this basic functionality with other features not usually found in simple text editors. pluma is a graphical application which supports editing multiple text files in one window (known sometimes as tabs or MDI). | ⬜ Add when this specific feature is needed. |
| `virtual_magnifying_glass` | 3.7.1.7.2509.0 | Virtual Magnifying Glass — Screen magnifier | ⬜ Requires `gtk2`. |
| `webkit2gtk40` | 2.46.5.7.2509.0 | WebKitGTK (API 4.0) — Web content engine library for GTK+ WebKit is a web content engine, derived from KHTML and KJS from KDE, and used primarily in Apple's Safari browser. It is made to be embedded in other applications, such as mail readers, or web browsers. It is able to display content such as HTML, SVG, XML, and others. It also supports DOM, XMLHttpRequest, XSLT, CSS, JavaScript/ECMAScript and more. WebKit2 is an API layer for WebKit designed from the ground up to support a split process model, where the web content lives in a separate process from the application UI. This build comes from the GTK+ port of WebKit (API version 4.0). This is the library for embedding in GTK+ applications. | ⬜ Requires `gtk3`, `libxslt`, `libwebp` …. |

### eLux Desktop Extensions

> eLux desktop extensions and taskbar enhancements. Recommended for all standard eLux desktop deployments.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `elux_theme` | 7.2501.0 | eLux desktop theme | ⬛ Always included with parent EPM. |
| `libopengl0` | 1.4.0.7.2404.0 | OpenGL support library — Vendor neutral GL dispatch library -- OpenGL support | ⬛ Always included with parent EPM. |
| `splashscreen` | 7.2603.0 | Splash screen utility — Shows a splash screen while the desktop is loading. | ⬛ Always included with parent EPM. |
| `ucdesktop` | 2.12.7.2603.0 | eLux Desktop user interface — Graphical user interface to provide the end user with desktop functionalities for setting up, managing and operating the system | ⬛ Always included with parent EPM. |
| `upilot` | 1.0.7.2510.0 | Enable uPilot — Default uPilot config file | 🔵 Included by default; remove if not required in your deployment. |
| `ucscreensaver` | 7.2603.0 | Screensaver — The eLux screen saver offers advanced security features and enhanced user experience. | ⬜ Requires `libopengl0`. |
| `webcamera_preview` | 7.2501.0 | Web camera preview — The eLux web camera preview offers multiple web cameras preview using cameraPreview command. | ⬜ Add when this specific feature is needed. |

### eLux Management components

> eLux management agent (Scout integration, policy enforcement, remote configuration). Required for centrally managed deployments.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `elux_management_base` | 7.2603.0 | Management base components — Provides all management components for eLux. | ⬛ Always included with parent EPM. |
| `elux_management_ucsettingsd` | 7.2603.0 | Settings daemon components — Provides all components for settings daemon. | ⬛ Always included with parent EPM. |

### Kernel x64

> Linux kernel and loadable modules. Select the FPM variant matching your hardware architecture. Most environments require only the standard x86-64 kernel.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `bootloader` | 3.8.3.7.2603.0 | UEFI boot manager — UEFI boot manager for x86 Linux systems | ⬛ Always included with parent EPM. |
| `extrafirmware` | 1.201.0.7.2603.0 | Extra firmware files — Extra firmware files in addition to the Linux kernel sources | ⬛ Always included with parent EPM. |
| `kernelimage` | 6.18.12.7.2603.0 | Kernel image x64 — Linux kernel 6.18.12 x86_64 | ⬛ Always included with parent EPM. |
| `kernel_deskflash_modules` | 1.70.0058.7.2603.0 | deskflash kernel module — The deskflash kernel modules, needed for the deskflash userland | ⬜ Add when this specific feature is needed. |
| `kernel_evdi_modules` | 1.14.11.7.2603.0 | evdi kernel module — The evdi kernel module, needed for DisplayLink | ⬜ Add when this specific feature is needed. |
| `kernel_hpuefi_modules` | 3.27.4.7.2603.0 | hpuefi kernel module — The hpuefi kernel module, needed for the HP BIOS Tools | ⬜ Add when this specific feature is needed. |
| `kernel_nvidia_modules` | 580.126.09.7.2603.0 | nvidia kernel modules — The nvidia kernel module | ⬜ Add when this specific feature is needed. |
| `wlanmodules` | 6.18.12.7.2603.0 | WLAN kernel modules — Linux kernel modules providing the stack for WLAN | ⬜ Add when this specific feature is needed. |

### NVIDIA Graphics Driver

> NVIDIA proprietary GPU driver. Include only on thin clients equipped with NVIDIA discrete graphics hardware.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `nvidia_driver_base` | 580.126.09.7.2603.0 | NVIDIA Graphics Driver base files — NVIDIA Accelerated Linux Graphics Driver | ⬛ Always included with parent EPM. |

### Perl system

> Perl interpreter and core libraries. Required by scripts or applications that depend on Perl.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `perl_base` | 5.34.0.7.2510.0 | Minimal Perl system — This package provides a Perl interpreter and the small subset of the standard run-time library required to perform basic tasks. For a full Perl installation, install "perl" (its dependencies, "perl-modules"). | ⬛ Always included with parent EPM. |
| `perl_modules` | 5.34.0.7.2510.0 | Core Perl modules — Architecture independent Perl modules. These modules are part of Perl and required if the `perl' package is installed. | ⬛ Always included with parent EPM. |
| `libperl` | 5.34.0.7.2510.0 | Shared Perl library — This package is required by programs which embed a Perl interpreter to ensure that the correct version of `perl-base' is installed. It additionally contains the shared Perl library on architectures where the perl binary is linked to libperl.a (currently only i386, for performance reasons). In other cases the actual library is in the `perl-base' package. Original-Maintainer: Niko Tyni <ntyni@debian.org> Homepage: http://dev.perl.org/perl5/ | 🔵 Included by default; remove if not required in your deployment. |

### Pulse Audio

> PulseAudio sound server. Required by any application producing audio output — virtual desktop clients, video conferencing, and multimedia.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `alsa_plugins` | 1.2.6.7.2404.0 | Alsa Plugins — Alsa Plugins necessary for PulsAudio | ⬛ Always included with parent EPM. |
| `pulse_dependencies` | 7.2505.0 | Dependency libraries — PulseAudio dependency libraries | ⬛ Always included with parent EPM. |
| `pulseaudiobase` | 15.99.1.7.2601.0 | Binaries — PulseAudio binaries and libraries | ⬛ Always included with parent EPM. |
| `pulseaudio_bluetooth` | 15.99.1.7.2407.0 | Bluetooth support — PulseAudio Bluetooth support | ⬜ Requires `blueztools`. |
| `pulseaudio_webrtc` | 15.99.1.7.2407.0 | Webrtc intergration — PulseAudio webrtc integration | ⬜ Requires `libwebrtc_audio_processing`. |

### System libraries

> Core system libraries shared across all packages. Mandatory for a functional eLux installation.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `gnupg` | 2.2.27.7.2603.0 | GNU privacy guard — GnuPG is GNU's tool for secure communication and data storage. It can be used to encrypt data and to create digital signatures. It includes an advanced key management facility and is compliant with the proposed OpenPGP Internet standard as described in RFC 4880. | ⬜ Add when this specific feature is needed. |
| `libarchive13` | 3.6.0.7.2509.0 | Multi-format archive library — The libarchive library provides a flexible interface for reading and writing archives in various formats such as tar and cpio. libarchive also supports reading and writing archives compressed using various compression filters such as gzip and bzip2. | ⬜ Add when this specific feature is needed. |
| `libcaca` | 0.99.19.7.2603.0 | colour ASCII art library — libcaca is the Colour AsCii Art library. It provides high level functions for colour text drawing, simple primitives for line, polygon and ellipse drawing, as well as powerful image to text conversion routines. http://caca.zoy.org/wiki/libcaca | ⬜ Add when this specific feature is needed. |
| `libdbusmenu` | 16.04.1.7.2601.0 | libdbusmenu — Library for passing menus over DBus | ⬜ Add when this specific feature is needed. |
| `libdouble_conversion3` | 3.1.7.7.2404.0 | routines to convert IEEE floats to and from strings — This library provides routines to convert IEEE single and double floats to and from string representations. It offers at lot of flexibility with respect to the conversion format: shortest, fixed, precision or exponential representation; decimal, octal or hexadecimal basis; control over number of digits, leading/trailing zeros and spaces. | ⬜ Add when this specific feature is needed. |
| `libevent` | 2.1.12.7.2404.0 | Asynchronous event notification library — Libevent is an asynchronous event notification library that provides a mechanism to execute a callback function when a specific event occurs on a file descriptor or after a timeout has been reached. | ⬜ Add when this specific feature is needed. |
| `libhunspell` | 1.7.0.7.2411.0 | Hunspell is a free spell checker and morphological analyzer library — Spell checker and morphological analyzer (program) | ⬜ Add when this specific feature is needed. |
| `libindicator` | 12.10.1.7.2601.0 | libindicator — Panel indicator applet | ⬜ Add when this specific feature is needed. |
| `libjsoncpp25` | 1.9.5.7.2404.0 | library for reading and writing JSON for C++ — jsoncpp is an implementation of a JSON reader and writer in C++. JSON (JavaScript Object Notation) is a lightweight data-interchange format that it is easy to parse and redable for human. It is useful for building config files, network communications protocols, etc. | ⬜ Add when this specific feature is needed. |
| `libmagic` | 5.41.7.2601.0 | Recognize the type of data in a file using "magic" numbers — This library can be used to classify files according to magic number tests. It implements the core functionality of the file command. | ⬜ Add when this specific feature is needed. |
| `libminizip1` | 1.1.7.2404.0 | compression library - minizip library — minizip is a minimalistic library that supports compressing, extracting, viewing, and manipulating zip files. | ⬜ Add when this specific feature is needed. |
| `libncurses5` | 6.3.7.2601.0 | ncurses5 shared libraries — shared libraries for terminal handling (legacy version) | ⬜ Add when this specific feature is needed. |
| `libnice` | 0.1.18.7.2601.0 | ICE library — libnice is a library that implements the Interactive Connectivity Establishment (ICE) standard (RFC 5245 & RFC 8445). It provides a GLib-based library, libnice, as well as GStreamer elements to use it. | ⬜ Add when this specific feature is needed. |
| `libnss` | 3.98.7.2601.0 | libnss — Network Security Service libraries | ⬜ Add when this specific feature is needed. |
| `libopenjp2` | 2.5.0.7.2601.0 | JPEG 2000 image compression/decompression library — OpenJPEG is a library for handling the JPEG 2000 image compression format. JPEG 2000 is a wavelet-based image compression standard and permits progressive transmission by pixel and resolution accuracy for progressive downloads of an encoded image. It supports lossless and lossy compression, supports higher compression than JPEG 1991, and has resilience to errors in the image. | ⬜ Add when this specific feature is needed. |
| `libpcap` | 1.10.1.7.2501.0 | libpcap — system interface for user-level packet capture | ⬜ Add when this specific feature is needed. |
| `libpgm` | 5.3.128.7.2404.0 | OpenPGM shared library — OpenPGM is an open source implementation of the Pragmatic General Multicast (PGM) specification in RFC 3208 available at www.ietf.org. PGM is a reliable and scalable multicast protocol that enables receivers to detect loss, request retransmission of lost data, or notify an application of unrecoverable loss. PGM is a receiver-reliable protocol, which means the receiver is responsible for ensuring all data is received, absolving the sender of reception responsibility. PGM runs over a best effort datagram service, currently OpenPGM uses IP multicast but could be implemented above switched fabrics such as InfiniBand. | ⬜ Add when this specific feature is needed. |
| `libpoppler` | 22.02.0.7.2601.0 | libpoppler — PDF rendering library Poppler is a PDF rendering library based on Xpdf PDF viewer. | ⬜ Add when this specific feature is needed. |
| `libre2` | 20220201.7.2404.0 | efficient, principled regular expression library — RE2 is a fast, safe, thread-friendly alternative to backtracking regular expression engines like those used in PCRE, Perl, and Python. It is a C++ library. | ⬜ Add when this specific feature is needed. |
| `libslang` | 2.3.2.7.2601.0 | S-Lang programming library — S-Lang is a C programmer's library that includes routines for the rapid development of sophisticated, user friendly, multi-platform applications. http://www.jedsoft.org/slang/ | ⬜ Add when this specific feature is needed. |
| `libsnappy` | 1.1.8.7.2404.0 | fast compression/decompression library — Snappy is a compression/decompression library. It does not aim for maximum compression, or compatibility with any other compression library; instead, it aims for very high speeds and reasonable compression. | ⬜ Add when this specific feature is needed. |
| `libsodium23` | 1.0.18.7.2603.0 | Network communication, cryptography and signaturing library — NaCl (pronounced "salt") is a new easy-to-use high-speed software library for network communication, encryption, decryption, signatures, etc. | ⬜ Add when this specific feature is needed. |
| `libsrtp` | 2.4.2.7.2601.0 | Secure RTP library — This library provides an implementation of the Secure Real-time Transport Protocol (SRTP), the Universal Security Transform (UST). | ⬜ Add when this specific feature is needed. |
| `libssl11legacy` | 1.1.1.7.2501.0 | Libssl 1.1 — Secure Sockets Layer toolkit - legacy 1.1 shared libraries | ⬜ Add when this specific feature is needed. |
| `libtbb12` | 2021.5.0.7.2404.0 | libtbb12 - parallelism library for C++ — TBB is a library that helps you leverage multi-core processor performance without having to be a threading expert. It represents a higher-level, task-based parallelism that abstracts platform details and threading mechanism for performance and scalability. | ⬜ Add when this specific feature is needed. |
| `libxerces_c` | 3.2.3.7.2601.0 | validating XML parser library for C++ — Xerces-C++ is a validating XML parser written in a portable subset of C++ | ⬜ Add when this specific feature is needed. |
| `libxnvctrl0` | 510.47.03.7.2404.0 | NV-CONTROL X extension (runtime library) — The NV-CONTROL X extension provides a mechanism for X clients to query and set configuration parameters of the NVIDIA X driver. State set by the NV-CONTROL X extension is assumed to be persistent only for the current server generation. | ⬜ Add when this specific feature is needed. |
| `lsb_release` | 12.1.7.2408.0 | Linux Standard Base version reporting utility (minimal implementation) — The Linux Standard Base (http://www.linuxbase.org/) is a standard core system that third-party applications written for Linux can depend upon. The lsb_release command is a simple tool to help identify the Linux distribution being used and its compliance with the Linux Standard Base. | ⬜ Add when this specific feature is needed. |
| `systemlibs_activate_mdns` | 0.1.0.7.2404.0 | Activate mDNS name resolution — Activates the mDNS name resolution via systemd-resolved on all interfaces | ⬜ Requires `resolved`. |
| `systemlibs_libavahi` | 0.8.7.2603.0 | Avahi mDNS/DNS-SD library — Avahi is a fully LGPL framework for Multicast DNS Service Discovery.It allows programs to publish and discover services and hostsrunning on a local network with no specific configuration. Forexample you can plug into a network and instantly find printers toprint to, files to look at and people to talk to.This package contains the Avahi Daemon which represents your machineon the network and allows other applications to publish and resolvemDNS/DNS-SD records. | ⬜ Add when this specific feature is needed. |
| `systemlibs_libavahi_bin` | 0.8.7.2603.0 | Binaries for Avahi mDNS/DNS-SD library — Avahi is a fully LGPL framework for Multicast DNS Service Discovery.It allows programs to publish and discover services and hostsrunning on a local network with no specific configuration. Forexample you can plug into a network and instantly find printers toprint to, files to look at and people to talk to.This package contains the Avahi Daemon which represents your machineon the network and allows other applications to publish and resolvemDNS/DNS-SD records. | ⬜ Requires `systemlibs_libavahi`, `systemlibs_libdaemon`. |
| `systemlibs_libayatana_indicator3` | 0.5.90.7.2601.0 | systemlibs_libayatana_indicator3 — A library and indicator to take menus from applications and place them in the panel. Successor of systemlibs_libindicator3. | ⬜ Cannot be installed alongside `systemlibs_libindicator3`. |
| `systemlibs_libconfuse2` | 3.3.7.2511.0 | libconfuse2 library — Library for parsing configuration files | ⬜ Add when this specific feature is needed. |
| `systemlibs_libdaemon` | 0.14.7.2601.0 | lightweight C library for daemons - runtime library — libdaemon is a lightweight C library which eases the writing of UNIX daemons.It consists of the following parts: * Wrapper around fork() for correct daemonization of a process * Wrapper around syslog() for simple log output to syslog or STDERR * An API for writing PID files * An API for serializing signals into a pipe for use with select() or poll() * An API for running subprocesses with STDOUT and STDERR redirected to syslogRoutines like these are included in most of the daemon software available. Itis not simple to get these done right and code duplication is not acceptable.This package includes the libdaemon run time shared library. | ⬜ Add when this specific feature is needed. |
| `systemlibs_libhidapi_libusb0` | 0.11.2.7.2511.0 | libhidapi-libusb0 library — Library for parsing configuration files | ⬜ Add when this specific feature is needed. |
| `systemlibs_libindicator3` | 12.10.1.7.2601.0 | libindicator3 — A library and indicator to take menus from applications and place them in the panel. DEPRECATED. | ⬜ Cannot be installed alongside `systemlibs_libayatana_indicator3`. |
| `systemlibs_libiniparser1` | 4.1.7.2511.0 | Ini parser library | ⬜ Add when this specific feature is needed. |
| `systemlibs_libpugixml` | 1.12.1.7.2503.0 | libpugixml — Light-weight C++ XML processing library. | ⬜ Add when this specific feature is needed. |
| `systemlibs_libudev0` | 249.11.7.2505.0 | Creates a symlink from libudev.so.0 to libudev.so.1 to fulfill dependencies — Links libudev.so.0 to libudev.so.1 | ⬜ Add when this specific feature is needed. |
| `systemlibs_libxml_cpp` | 2.40.1.7.2507.0 | libxml_cpp — C++ XML wrapper library around libxml. | ⬜ Add when this specific feature is needed. |

### X.Org XWindows system

> X.Org display server. Required for any graphical environment. All display-dependent packages depend on this EPM.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `xorg_binaries` | 7.7.7.2505.0 | Binaries — Provides the system binaries fof the X-Server 21.1.4 including some applications | ⬛ Always included with parent EPM. |
| `xorg_configuration` | 7.2511.0 | Server start and configuration — Provides the configuration and start scripts for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_dri` | 23.2.1.7.2511.0 | DRI support — Provides the Direct Rendering Interface (DRI) support for the X-Server 21.1.4 based on Mesa 23.2.1. Actually supported chipsets are: Intel i810, i915 and i965; ATI mach64 and Radeon r128, r200, r300, r600, radeonSI, amdgpu; NVIDIA nouveau. | ⬛ Always included with parent EPM. |
| `xorg_extensions` | 21.1.4.7.2509.0 | Server extensions — Provides the extensions for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_fonts` | 1.0.5.7.2505.0 | Server fonts — Provides the core fonts, the misc fonts and the true-type fonts for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_fonts_noto_cjk` | 20220127.7.2601.0 | Fonts Noto CJK — Noto font families for Traditional Chinese, Simplified Chinese, Japanese and Korean | ⬛ Always included with parent EPM. |
| `xorg_graphics_drivers` | 22.0.0.7.2505.0 | Graphics drivers — Provides graphics drivers for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_input_drivers` | 1.2.1.7.2505.0 | Input drivers — Provides graphics drivers for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_keyboard` | 2.33.7.2404.0 | Keyboard support — Provides keyboard support for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_libraries` | 1.7.5.7.2603.0 | Libraries — Provides the system libraries for the X-Server 21.1.4 including the ones for the corresponding applications | ⬛ Always included with parent EPM. |
| `xorg_locale` | 1.7.5.7.2404.0 | Locale — Provides the locale for the X-Server 21.1.4 | ⬛ Always included with parent EPM. |
| `xorg_utilities` | 7.7.7.2404.0 | Utilities of the Server — Provides utilities of the X-Server 21.1.4, which are required by other applications but not by the X-Server itself | 🔵 Included by default; remove if not required in your deployment. |
| `hwaccdrivers` | 23.2.1.7.2603.0 | HwVideoAcc Drivers — Hardware accelerated video libraries and drivers. Device independent hardware acceleration abstraction libraries and drivers to access video decoder and encoder on GPUs from AMD, Intel and Nvidia plus tools to check if hardware acceleration is working or not | ⬜ Add when this specific feature is needed. |
| `mirror_client` | 1.12.0.7.2404.0 | VNC client — Provides the client to to be able to monitor a server remote by using the VNC protocol. | ⬜ Add when this specific feature is needed. |
| `mirror_server` | 1.12.0.7.2601.0 | VNC server extension — Provides the server to enable remote monitoring by using the VNC protocol. | ⬜ Add when this specific feature is needed. |
| `xorg_ddcutil` | 1.2.2.7.2507.0 | ddcutil monitor control — Control monitor parameters | ⬜ Add when this specific feature is needed. |
| `xorg_wacom` | 1.0.0.7.2507.0 | Wacom support — Provides support for Wacom tablets. | ⬜ Add when this specific feature is needed. |

## Utility

Administrative utilities, virtual keyboards, firmware updaters, and management helpers.

### BIOS tools

> Include when BIOS/UEFI configuration utilities are required for endpoint provisioning or vendor-specific BIOS management.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `bios_update` | 7.2511.0 | BIOS Update — Bios update system. | ⬛ Always included with parent EPM. |
| `dell5060` | 2.47.0.1.7.2509.0 | DELL 5020, 5060 tool — DELL BIOS flash tools for devices DELL 5020 DELL 5060. | 🔵 Included by default; remove if not required in your deployment. |
| `dellcommandconfigure` | 4.3.0.83.7.2509.0 | Dell Command Configure — Dell Command Configure for Wyse 5070 | 🔵 Included by default; remove if not required in your deployment. |
| `deskflash` | 1.80.0209.0.7.2509.0 | deskflash — The deskflash program allows the administrator to update the system BIOS. | 🔵 Included by default; remove if not required in your deployment. |
| `hp_bios_config` | 1.08.201110.4.7.2509.0 | HP Bios configuration tools — HP BIOS config tool | 🔵 Included by default; remove if not required in your deployment. |
| `hp_bios_flash` | 3.25.7.2509.0 | HP Bios Flash tools — ToolLess HP BIOS Update | 🔵 Included by default; remove if not required in your deployment. |

### MAPT Implementation Dell

> Dell Management and Provisioning Tool (MAPT) integration. Select only on Dell hardware managed via the Dell endpoint management stack.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `dell_mapt_realtek_rtl8153` | 7.0.0 | MAPT for Realtek RTL8153 — Support for MAC Address Passthrough for DELL devices with integrated Realtek RTL8153 USB NIC | ⬛ Always included with parent EPM. |

### MAPT Implementation Fujitsu

> Fujitsu MAPT integration. Select only on Fujitsu hardware managed via Fujitsu endpoint management tools.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `fujitsu_mapt_base` | 1.2.6.7.2507.0 | MAPT implementation — Support for MAC Address Passthrough for FUJITSU devices with integrated Network | ⬛ Always included with parent EPM. |

### onboard virtual keyboard

> On-screen virtual keyboard. Recommended for touchscreen or kiosk deployments where a physical keyboard is not available.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `onboard_virtual_keyboard` | 1.4.1.7.2603.0 | onboard virtual keyboard — An onscreen keyboard useful for tablet PC users and for mobility impaired users. | ⬛ Always included with parent EPM. |

### ThinPrint Client

> ThinPrint virtual print channel. Include when printing through virtual desktop sessions using the ThinPrint infrastructure.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `thnuclnt` | 8.10.65 | ThinPrint Client (thnuclnt) — ThinPrint Client | ⬛ Always included with parent EPM. |

### XInput Calibrator

> Touchscreen input calibration tool. Include for touchscreen deployments where calibration may be needed.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `xinput_calibrator_base` | 0.7.5 | Calibrator binary — Because all existing calibrators were driver dependent and hard to use, xinput_calibrator was created. The goal of xinput_calibrator is to: * work for any Xorg driver (use Xinput to get axis valuators), * output the calibration as Xorg.conf, HAL policy and udev rule, * support advanced driver options, such as Evdev's dynamic calibration, * have a very intuitive GUI (normal X client). Licence: MIT/X11 License | ⬛ Always included with parent EPM. |

## Miscellaneous

Specialty packages, vendor-specific extensions, and third-party integrations.

### Standalone packages

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `Metsa_apn` | 0.0.4 | Metsä APN configuration | ⬜ Requires `wwandrivers`, `wwan_force_apn`. |
| `Metsa_cert` | 0.0.4 | Metsä root certificates | ⬜ Add when this specific feature is needed. |

### Avaya Workplace VDI

> Avaya Workplace VDI client for Unified Communications optimization inside virtual desktop sessions.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `workplacevdibase` | 3.0.15.0 | Avaya Workplace VDI programs and libraries — Programs and libraries for Avaya Workplace VDI | ⬛ Always included with parent EPM. |

### Boost library

> Boost C++ libraries. Required as a dependency by specific applications; not typically selected manually.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `boost_container` | 1.81.0.7.2404.0 | boost container — Boost.Container library implements several well-known containers, including STL containers. The aim of the library is to offer advanced features not present in standard containers or to offer the latest standard draft features for compilers that don't comply with the latest C++ standard. | ⬜ Add when this specific feature is needed. |
| `boost_filesystem` | 1.81.0.7.2404.0 | boost filesystem library — The Boost.Filesystem library provides facilities to manipulate files and directories, and the paths that identify them. | ⬜ Requires `boost_system`. |
| `boost_json` | 1.81.0.7.2404.0 | boost json — Boost.JSON is a portable C++ library which provides containers and algorithms that implement JSON | ⬜ Add when this specific feature is needed. |
| `boost_program_options` | 1.81.0.7.2507.0 | boost program options library — Program options library for C++ | ⬜ Add when this specific feature is needed. |
| `boost_random` | 1.81.0.7.2404.0 | boost random library — Random numbers are useful in a variety of applications. The Boost Random Number Library (Boost.Random for short) provides a variety of generators and distributions to produce random numbers having useful properties, such as uniform distribution. | ⬜ Add when this specific feature is needed. |
| `boost_system` | 1.81.0.7.2404.0 | boost system library — While exceptions are the preferred C++ default error code reporting mechanism, users of libraries dependent on low-level API's often need overloads reporting error conditions via error code arguments and/or return values rather than via throwing exceptions. Otherwise, when errors are not exceptional occurrences and must be dealt with as they arise, programs become littered with try/catch blocks, unreadable, and very inefficient. The Boost System library supports both error reporting by exception and by error code. | ⬜ Add when this specific feature is needed. |
| `boost_thread` | 1.81.0.7.2404.0 | boost thread library — Boost.Thread enables the use of multiple threads of execution with shared data in portable C++ code. It provides classes and functions for managing the threads themselves, along with others for synchronizing data between the threads or providing separate copies of data specific to individual threads. | ⬜ Add when this specific feature is needed. |
| `boost_url` | 1.81.0.7.2507.0 | boost url — C++ library that implements "URL" | ⬜ Add when this specific feature is needed. |

### FileFetch utility

> FileFetch utility for retrieving remote configuration files. Include when custom boot or provisioning scripts rely on FileFetch.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `filefetch_base` | 1.0.0 | FileFetch programs and libraries | ⬛ Always included with parent EPM. |

### Grundig Citrix Extensions

> Grundig dictation device driver for Citrix ICA sessions. Include when users have Grundig dictation hardware and connect via Citrix Workspace App.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `Grundig_ICA` | 8.0 | Grundig ICA module | ⬛ Always included with parent EPM. |

### Grundig eLuxRDP Extension

> Grundig dictation device driver for eLux RDP sessions. Include when users have Grundig dictation hardware and connect via the eLux RDP client.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `GruMMC` | 3.0 | GruMMC Plugin | ⬛ Always included with parent EPM. |

### Jabra Xpress

> Jabra Xpress device management for Jabra headsets and audio devices. Include when Jabra hardware is deployed and requires firmware management.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `JDU` | 8.5.10 | JDU — Jabra Device Updater (JDU) and Audio Device Dashboard (ADD) client. | ⬛ Always included with parent EPM. |

### Metsä custom configuration

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `Metsa_apn` | 0.0.5 | Metsä APN configuration | ⬛ Always included with parent EPM. |
| `Metsa_cert` | 0.0.5 | Metsä root certificates | ⬛ Always included with parent EPM. |

### Migration Enablement

> Assists migration from earlier eLux versions. Include only during a version upgrade migration process; remove once migration is complete.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `migration_enablement_base` | 7.2408.0 | Migration Enablement — Enables migration from previous eLux 7 versions to eLux 7.2409.0 or higher. | ⬛ Always included with parent EPM. |

### Olympus Dictation Drivers

> Olympus dictation device drivers. Include in deployments where users use Olympus dictation hardware.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `olydrv_bin` | 4.0.5 | Utils for Citrix — Diagnostic utilities for Citrix virtual channel for Olympus dictation devices | ⬛ Always included with parent EPM. |
| `olydrv_ica` | 4.0.5 | Driver for Citrix — Citrix virtual channel for Olympus dictation devices | ⬛ Always included with parent EPM. |

### Python3 interpreter and core libraries

> Python 3 interpreter. Required by scripts or management agents that depend on Python.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `python3_base` | 3.10.12.7.2603.0 | Python3 interpreter and core libraries — Interactive high-level object-oriented language (default python3 version). | ⬛ Always included with parent EPM. |
| `python3_brlapi` | 6.4.7.2404.0 | Python bindings for braille display access — Braille display access via BRLTTY - Python3 bindings | ⬜ Add when this specific feature is needed. |
| `python3_cairo` | 1.20.1.7.2404.0 | Python bindings for cairo — Python 3 bindings for the Cairo vector graphics library | ⬜ Add when this specific feature is needed. |
| `python3_dbus` | 1.2.18.7.2505.0 | Python 3 dbus — Simple interprocess messaging system (Python 3 interface) | ⬜ Add when this specific feature is needed. |
| `python3_gi` | 3.42.1.7.2411.0 | Python bindings for GI — Python 3 bindings for gobject-introspection libraries | ⬜ Requires `gir_libs`. |
| `python3_gi_cairo` | 3.42.1.7.2505.0 | Python 3 gi cairo — Python 3 Cairo bindings for the GObject library | ⬜ Add when this specific feature is needed. |
| `python3_louis` | 3.20.0.7.2404.0 | Python bindings for liblouis | ⬜ Add when this specific feature is needed. |
| `python3_pyatspi` | 2.38.2.7.2411.0 | Python bindings for ATSPI — Assistive Technology Service Provider Interface - Python3 bindings | ⬜ Requires `gir_libs`. |
| `python3_speechd` | 0.11.1.7.2404.0 | Python interface to Speech Dispatcher | ⬜ Add when this specific feature is needed. |

### SecMaker Net iD PKCS #11 Library

> SecMaker Net iD PKCS#11 library. Select when SecMaker smart cards are used for certificate-based authentication.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `secmakerclient_libpkcs11` | 6.8.5.20 | SecMaker Net iD PKCS #11 Library — PKCS#11 libraries for Net iD middleware from SecMaker | ⬛ Always included with parent EPM. |

### uberAgent for Linux

> uberAgent endpoint analytics. Include when the environment is monitored with uberAgent for user experience and performance telemetry.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `uberagent_base` | 7.6.0.7237 | uberAgent base files | ⬛ Always included with parent EPM. |

### Wget network downloader

> GNU Wget network download utility. Required by provisioning or bootstrap scripts that use Wget to fetch files.

| Package | Version | Description | When to select |
|---------|---------|-------------|----------------|
| `wget_binaries` | 1.21.2.7.2505.0 | Programs and libraries — GNU Wget is a free utility for non-interactive download of files from the Web. It supports HTTP, HTTPS, and FTP protocols, as well as retrieval through HTTP proxies. | ⬛ Always included with parent EPM. |

---

*Generated from the ELIAS image server — `uc-elux7-2603` container. Package availability may vary between image versions.*
