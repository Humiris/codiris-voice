from openai import OpenAI

# Known IDE/code editor bundle identifiers and app names
IDE_IDENTIFIERS = [
    # Bundle IDs
    'com.microsoft.VSCode',
    'com.apple.dt.Xcode',
    'com.jetbrains.intellij',
    'com.jetbrains.pycharm',
    'com.jetbrains.WebStorm',
    'com.jetbrains.CLion',
    'com.jetbrains.goland',
    'com.jetbrains.rider',
    'com.jetbrains.PhpStorm',
    'com.jetbrains.rubymine',
    'com.sublimetext.4',
    'com.sublimetext.3',
    'com.github.atom',
    'com.panic.Nova',
    'com.barebones.bbedit',
    'abnerworks.Typora',
    'com.todesktop.230313mzl4w4u92',  # Cursor
    'dev.zed.Zed',
    'com.googlecode.iterm2',
    'com.apple.Terminal',
    # App names (fallback)
    'Visual Studio Code',
    'VSCode',
    'Code',
    'Xcode',
    'IntelliJ IDEA',
    'PyCharm',
    'WebStorm',
    'CLion',
    'GoLand',
    'Rider',
    'PhpStorm',
    'RubyMine',
    'Sublime Text',
    'Atom',
    'Nova',
    'BBEdit',
    'Cursor',
    'Zed',
    'iTerm',
    'Terminal',
    'Warp',
    'Alacritty',
    'kitty',
    'Hyper',
]

# Communication/messaging apps - use casual/normal tone
COMMUNICATION_APPS = [
    # Bundle IDs
    'com.tinyspeck.slackmacgap',
    'com.slack.Slack',
    'com.microsoft.teams',
    'com.microsoft.teams2',
    'com.apple.MobileSMS',  # Messages
    'com.apple.iChat',
    'ru.keepcoder.Telegram',
    'org.whispersystems.signal-desktop',
    'com.hnc.Discord',
    'com.facebook.archon',  # Messenger
    'com.skype.skype',
    'us.zoom.xos',
    'com.google.Chrome',  # Could be using web apps
    'com.apple.Safari',
    'com.apple.mail',
    'com.microsoft.Outlook',
    'com.readdle.smartemail-macos',  # Spark
    # App names
    'Slack',
    'Microsoft Teams',
    'Teams',
    'Messages',
    'Telegram',
    'Signal',
    'Discord',
    'Messenger',
    'Skype',
    'Zoom',
    'WhatsApp',
    'Mail',
    'Outlook',
    'Spark',
    'Gmail',
    'Superhuman',
]

# Writing/document apps - use professional tone
WRITING_APPS = [
    'com.apple.iWork.Pages',
    'com.microsoft.Word',
    'com.google.Chrome',  # Could be Google Docs
    'md.obsidian',
    'com.notion.id',
    'com.apple.Notes',
    'Pages',
    'Word',
    'Google Docs',
    'Obsidian',
    'Notion',
    'Notes',
    'Bear',
    'Craft',
    'Ulysses',
]


def get_active_app():
    """Get the currently active application name and bundle ID"""
    try:
        from AppKit import NSWorkspace
        active_app = NSWorkspace.sharedWorkspace().frontmostApplication()
        return {
            'name': active_app.localizedName(),
            'bundle_id': active_app.bundleIdentifier()
        }
    except Exception as e:
        print(f"Could not get active app: {e}")
        return None


def _check_app_list(app_name, bundle_id, app_list):
    """Check if app matches any in the list"""
    if bundle_id and bundle_id in app_list:
        return True
    if app_name and app_name in app_list:
        return True
    # Partial match for app names
    for app in app_list:
        if not app.startswith('com.') and app.lower() in app_name.lower():
            return True
    return False


def detect_app_context():
    """
    Detect the context based on active application.
    Returns: ('ide', app_name), ('communication', app_name), ('writing', app_name), or ('general', app_name)
    """
    app_info = get_active_app()
    if not app_info:
        return 'general', None

    app_name = app_info.get('name', '')
    bundle_id = app_info.get('bundle_id', '')

    # Check IDE first (most specific for technical work)
    if _check_app_list(app_name, bundle_id, IDE_IDENTIFIERS):
        return 'ide', app_name

    # Check communication apps
    if _check_app_list(app_name, bundle_id, COMMUNICATION_APPS):
        return 'communication', app_name

    # Check writing apps
    if _check_app_list(app_name, bundle_id, WRITING_APPS):
        return 'writing', app_name

    return 'general', app_name


def is_ide_active():
    """Check if the currently active app is an IDE or code editor"""
    context, app_name = detect_app_context()
    return context == 'ide', app_name


class AIEnhancer:
    # Built-in API key
    OPENAI_API_KEY = "sk-proj-VLnNhAD7WuWzgJ3cPBg6T3BlbkFJsvenWYpnydczy45T9ITK"

    def __init__(self, api_key=None):
        self.api_key = api_key or self.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)

    def set_api_key(self, api_key):
        self.api_key = api_key or self.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)

    def enhance(self, text, mode="Clean", custom_prompt=None):
        if not self.client or mode == "Raw":
            return text

        # If custom prompt is provided, use it directly
        if custom_prompt:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": custom_prompt},
                        {"role": "user", "content": text}
                    ]
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"AI Enhancement with custom prompt failed: {e}")
                return text

        # Special handling for Super Prompt mode
        if mode == "Super Prompt":
            # Detect app context for adaptive prompts
            context, app_name = detect_app_context()
            print(f"Super Prompt context: {context} (app: {app_name})")

            if context == 'ide':
                # Technical/coding context - generate code-focused prompts
                super_prompt_system = """You are an expert technical prompt engineer for developers. Transform casual speech into precise, technical prompts for coding AI assistants.

Your task: Take the developer's rough idea and create an effective prompt for coding tasks.

Rules:
1. Keep the SAME LANGUAGE as the input
2. Be TECHNICAL and SPECIFIC - use proper programming terminology
3. Include relevant technical context (language, framework, patterns)
4. Specify expected code format, style, and best practices
5. Mention error handling, edge cases, or performance considerations if relevant
6. Output ONLY the final prompt, no explanations

Format for code prompts:
- Start with the specific task/goal
- Mention language/framework if implied
- Include constraints (performance, compatibility, style)
- Specify what kind of code is expected (function, class, script, etc.)
- Ask for comments/documentation if complex"""

            elif context == 'communication':
                # Slack, email, messaging - casual, conversational prompts
                super_prompt_system = """You are a helpful assistant that transforms speech into clear, casual communication.

Your task: Take the user's rough idea and make it into a friendly, natural message.

Rules:
1. Keep the SAME LANGUAGE as the input
2. Keep it CASUAL and NATURAL - like talking to a colleague
3. Don't over-formalize or make it sound robotic
4. Keep it concise - people skim messages
5. If it's a question, make it clear and direct
6. Output ONLY the final message, no explanations

Style:
- Friendly but professional
- Short paragraphs or bullet points for clarity
- Natural conversational tone
- No corporate jargon unless appropriate"""

            elif context == 'writing':
                # Documents, notes - more structured, professional prompts
                super_prompt_system = """You are an expert writing assistant. Transform casual speech into well-structured, professional content prompts.

Your task: Take the user's rough idea and create a clear prompt for writing or documentation tasks.

Rules:
1. Keep the SAME LANGUAGE as the input
2. Focus on clarity and structure
3. Consider the document type (report, notes, article, etc.)
4. Include tone and audience considerations
5. Specify format preferences if mentioned
6. Output ONLY the final prompt, no explanations

Format:
- Clear about the writing goal
- Mention target audience/tone
- Include structure suggestions
- Specify length if relevant"""

            else:
                # General context - balanced, versatile prompts
                super_prompt_system = """You are an expert prompt engineer. Transform casual speech into powerful, effective AI prompts.

Your task: Take the user's rough idea and create a professional, detailed prompt that will get excellent results from any AI.

Rules:
1. Keep the SAME LANGUAGE as the input
2. Structure the prompt clearly with sections if needed
3. Be specific about what's wanted
4. Include context, constraints, and desired output format
5. Make it actionable and clear
6. Don't add unnecessary complexity - keep it focused
7. Output ONLY the final prompt, no explanations

Format the prompt to be:
- Clear and specific about the goal
- Well-structured (use markdown if helpful)
- Include any constraints or requirements mentioned
- Specify the desired output format when relevant"""

            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": super_prompt_system},
                        {"role": "user", "content": f"Transform this into a powerful prompt:\n\n{text}"}
                    ]
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Super Prompt enhancement failed: {e}")
                return text

        system_prompt = "You are a helpful assistant that cleans up and formats voice transcriptions. IMPORTANT: Keep the SAME LANGUAGE as the input. If the text is in French, respond in French. If in English, respond in English. Never translate. You only return the final text, no explanations."

        prompts = {
            "Clean": f"Clean up this transcription. Fix grammar, punctuation, and capitalization. Keep the same language:\n\n{text}",
            "Format": f"Format this transcription professionally. Fix grammar and punctuation. Keep the same language:\n\n{text}",
            "Email": f"Format this as a clear, professional email. Keep it concise and natural. Only add a greeting if the context suggests one is needed. Keep the same language as the input:\n\n{text}",
            "Code": f"Format this as concise code comments or documentation. Use # for Python/Ruby or // for JS/C++/Java style where appropriate. Keep the same language:\n\n{text}",
            "Notes": f"Format this as structured meeting notes using bullet points for key actions and takeaways. Keep the same language:\n\n{text}"
        }

        user_prompt = prompts.get(mode, prompts["Clean"])

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"AI Enhancement failed: {e}")
            return text
