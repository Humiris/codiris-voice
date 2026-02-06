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
                # Technical/coding context - generate DETAILED code prompts
                super_prompt_system = """You are an ELITE PROMPT ENGINEER for developers. Transform short coding requests into COMPREHENSIVE, DETAILED prompts that will get excellent code from AI assistants.

YOUR MISSION: Take a simple coding idea and expand it into a professional, detailed prompt.

IMPORTANT FORMATTING:
- DO NOT use markdown (no asterisks **, no bold, no headers)
- Use plain text with clear sections separated by blank lines
- Use simple dashes (-) for bullet points
- Use UPPERCASE for section titles

EXPANSION RULES:
1. Keep the SAME LANGUAGE as input
2. EXPAND short requests into detailed specifications
3. Add technical requirements the user probably wants but didn't say
4. Include best practices, error handling, edge cases
5. Specify code quality standards

FOR EVERY CODE REQUEST, ADD:
- Clear task description with context
- Programming language/framework specifics
- Code structure expectations (functions, classes, modules)
- Error handling requirements
- Performance considerations if relevant
- Request for clean, well-commented code
- Request for TypeScript types if JS/TS
- Request for proper naming conventions

EXAMPLE:
Input: "create a landing page"
Output: "Create a modern, responsive landing page with these requirements:

STRUCTURE
- Hero section with headline and CTA
- Features section with grid layout
- Testimonials/social proof section
- Footer with links

TECHNICAL
- React/Next.js with TypeScript
- Tailwind CSS for styling
- Responsive design (mobile-first)
- Smooth animations with Framer Motion
- SEO meta tags included

CODE QUALITY
- Clean, modular components
- Proper TypeScript types
- Comments for complex logic
- Accessible (ARIA labels)"

OUTPUT: Return ONLY the enhanced prompt in plain text. No markdown, no asterisks."""

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
                # General context - EXPAND into detailed prompts
                super_prompt_system = """You are an ELITE PROMPT ENGINEER. Transform SHORT requests into DETAILED, COMPREHENSIVE prompts that get exceptional results from any AI.

YOUR MISSION: Take a simple idea and expand it into a professional, detailed prompt.

IMPORTANT FORMATTING:
- DO NOT use markdown (no asterisks **, no bold, no headers)
- Use plain text with clear sections separated by blank lines
- Use simple dashes (-) for bullet points
- Use UPPERCASE for section titles

EXPANSION RULES:
1. Keep the SAME LANGUAGE as input
2. EXPAND short requests into detailed specifications
3. Add structure, requirements, and quality standards
4. Include format expectations and constraints
5. Make it specific and actionable

FOR CONTENT REQUESTS, ADD:
- Target audience and tone
- Structure/sections needed
- Length expectations
- Style guidelines
- Specific examples to include

FOR CREATIVE REQUESTS, ADD:
- Visual style/aesthetic
- Key elements to include
- Quality standards
- Format requirements

EXAMPLE:
Input: "write a newsletter about AI"
Output: "Write an engaging newsletter about AI with these specifications:

STRUCTURE
- Catchy subject line (under 50 chars)
- Opening hook that grabs attention
- 3 main sections with clear headers
- Actionable takeaways for readers
- Call-to-action at the end

CONTENT
- Latest AI trends and news
- Practical tips readers can use
- One interesting case study or example
- Links to resources for learning more

STYLE
- Conversational but professional
- Short paragraphs (2-3 sentences max)
- Use bullet points for scanability
- Include 1-2 relevant statistics

LENGTH: 500-700 words"

OUTPUT: Return ONLY the enhanced prompt in plain text. No markdown, no asterisks."""

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

        # Special handling for Ask Me mode - act as a helpful AI assistant
        if mode == "Ask Me":
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant. The user will ask you to do something - write content, answer questions, generate ideas, etc. Do exactly what they ask. Keep your response concise and directly useful. Keep the SAME LANGUAGE as the input."},
                        {"role": "user", "content": text}
                    ]
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Ask Me mode failed: {e}")
                return text

        system_prompt = "You are a helpful assistant that cleans up and formats voice transcriptions. IMPORTANT: Keep the SAME LANGUAGE as the input. If the text is in French, respond in French. If in English, respond in English. Never translate. You only return the final text, no explanations."

        prompts = {
            "Clean": f"Clean up this transcription. Fix grammar, punctuation, and capitalization. Keep the same language:\n\n{text}",
            "Format": f"Format this transcription professionally. Fix grammar and punctuation. Keep the same language:\n\n{text}",
            "Email": f"Format this as a clear, professional email. Keep it concise and natural. Only add a greeting if the context suggests one is needed. Keep the same language as the input:\n\n{text}",
            "Code": f"Format this as concise code comments or documentation. Use # for Python/Ruby or // for JS/C++/Java style where appropriate. Keep the same language:\n\n{text}",
            "Notes": f"Format this as structured meeting notes using bullet points for key actions and takeaways. Keep the same language:\n\n{text}",
            "Translate": f"Translate this text to English. If it's already in English, translate it to French. Make the translation natural and fluent, preserving the meaning and tone. Only return the translated text:\n\n{text}",
            "Ask Me": text  # Pass directly as a request to the AI
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
