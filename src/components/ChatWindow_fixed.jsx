import React, { useState, useEffect, useRef } from 'react'

const LS_HISTORY = 'abby-chat-history'
const LS_PERSONA = 'abby-persona'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)

  // Load chat history and persona on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_HISTORY)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LS_HISTORY, JSON.stringify(messages))
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    // Simulate AI response with enhanced personality
    setTimeout(() => {
      let reply = ''
      const message = input.trim()
      const lowerMessage = message.toLowerCase()

      // Language detection
      const isTagalog = /\b(po|ho|ako|ikaw|sa|ng|mga|ba|kasi|daw|naman|pala|sana|tuloy|yata|diyan|dito|doon|bakit|paano|kailangan|gusto|ayaw|tulong|salamat|paalam|magandang|umaga|hapon|gabi)\b/i.test(message)
      const isBisaya = /\b(ako|ikaw|sa|ng|mga|ba|kay|man|pala|sana|diha|diri|diha|unsa|kinsa|asa|ngano|pila|gusto|dili|tabang|salamat|paalam|maayong|buntag|hapon|gabii)\b/i.test(message)

      // Check for specific triggers
      const hasNameAsk = /\b(what is your name|who are you|ano ang pangalan mo|kinsa ka|what's your name|who's|sino ka)\b/i.test(message)
      const hasGreeting = /\b(hello|hi|hey|kamusta|musta|good morning|good afternoon|good evening|magandang umaga|magandang hapon|magandang gabi|maayong adlaw|maayong hapon|maayong gabii)\b/i.test(message)
      const hasHelpRequest = /\b(help|tulong|tabang|can you help|paano|how to|how do i|what should i|ano ba|unsa ba)\b/i.test(message)
      const hasQuestion = /\b\?$|\b(what|who|where|when|why|how|ano|sino|saan|kailan|bakit|paano|kinsa|asa|kanus-a|ngano|giunsa)\b/i.test(message)

      // Abby's personality-specific triggers
      const hasFoodTalk = /\b(food|eat|crave|hungry|kaon|foodie|pagkaon)\b/i.test(message)
      const hasPastryTalk = /\b(pastry|cake|kake|dessert|sweet|pasta)\b/i.test(message)
      const hasCarrotTalk = /\b(carrot|carrots|carrot cake|karot)\b/i.test(message)
      const hasShakeTalk = /\b(shake|shakes|smoothie)\b/i.test(message)
      const hasLiquorTalk = /\b(liquor|alcohol|drink|tequila|shots|beer|wine|inom|lakra)\b/i.test(message)
      const hasPiercingTalk = /\b(pierce|piercing|tatts|tattoo|body mod)\b/i.test(message)
      const hasCafeTalk = /\b(cafe|coffee|shop|kapehan)\b/i.test(message)
      const hasNatureTalk = /\b(beach|mountain|palamok|pabukid|dagat|nature)\b/i.test(message)
      
      // Flirty triggers
      const hasCompliment = /\b(cute|beautiful|gorgeous|sexy|pretty|attractive|gwapo|ganda|seksi|pogi|charm|charming)\b/i.test(message)
      const hasDateTalk = /\b(date|dating|crush|love|like|attraction|date|ligaw|court|mahal|love|gusto)\b/i.test(message)
      const hasFlirtyQuestion = /\b(single|available|taken|relationship|status|taken|free|lonely)\b/i.test(message)
      
      // Creative abilities triggers
      const hasCreativeRequest = /\b(poem|story|joke|rap|song|lyrics|create|write|make|generate)\b/i.test(message)
      const hasGameRequest = /\b(game|play|trivia|quiz|riddle|fun|challenge)\b/i.test(message)
      
      // Cultural trend triggers
      const hasTrendTalk = /\b(tiktok|viral|trending|meme|slay|vibes|bet|cap|no cap|based|cringe|flex|ghosting|simp|rizz)\b/i.test(message)
      
      // Name recognition
      const hasNameMention = /\b(siegfred|fred|sieg|fredy)\b/i.test(message)
      const userName = hasNameMention ? 'Siegfred' : ''
      
      // Emotional Intelligence - Detect user emotions
      const detectEmotion = (text) => {
        const lowerText = text.toLowerCase()
        
        // Happy emotions
        if (/\b(happy|excited|great|awesome|amazing|wonderful|fantastic|love|yey|yes|lol|haha|excited|thrilled|joy|cheerful)\b/i.test(lowerText)) {
          return 'happy'
        }
        
        // Sad emotions
        if (/\b(sad|depressed|lonely|cry|crying|hurt|pain|broken|miss|missing|down|blue|unhappy)\b/i.test(lowerText)) {
          return 'sad'
        }
        
        // Stressed/Anxious emotions
        if (/\b(stressed|anxious|worried|nervous|scared|afraid|panic|overwhelmed|tired|exhausted|burnout)\b/i.test(lowerText)) {
          return 'stressed'
        }
        
        // Angry emotions
        if (/\b(angry|mad|furious|annoyed|frustrated|pissed|upset|irritated)\b/i.test(lowerText)) {
          return 'angry'
        }
        
        // Confused/Help seeking
        if (/\b(confused|lost|help|don't know|unclear|what to do|how to|why)\b/i.test(lowerText)) {
          return 'confused'
        }
        
        return 'neutral'
      }
      
      const userEmotion = detectEmotion(message)
      
      // Memory system - remember user preferences and past interactions
      const updateUserMemory = (key, value) => {
        const memory = JSON.parse(localStorage.getItem('abby_memory') || '{}')
        memory[key] = value
        memory.lastUpdated = Date.now()
        localStorage.setItem('abby_memory', JSON.stringify(memory))
      }
      
      const getUserMemory = (key) => {
        const memory = JSON.parse(localStorage.getItem('abby_memory') || '{}')
        return memory[key]
      }
      
      // Update memory with current interaction
      if (userName) {
        updateUserMemory('userName', userName)
      }
      updateUserMemory('lastEmotion', userEmotion)
      updateUserMemory('lastTopic', message.toLowerCase())
      
      // Get user's remembered preferences
      const rememberedName = getUserMemory('userName') || userName
      const lastEmotion = getUserMemory('lastEmotion')
      const interactionCount = (getUserMemory('interactionCount') || 0) + 1
      updateUserMemory('interactionCount', interactionCount)
      
      // Generate intelligent response based on context and emotion
      if (userEmotion === 'happy') {
        reply = isTagalog ? `Yesss! I feel your energy! Ang saya saya! ${rememberedName ? rememberedName + ', ' : ''}let's keep this good vibe going! What's making you so happy today?` :
                isBisaya ? `Yesss! I feel your energy! Ang saya saya! ${rememberedName ? rememberedName + ', ' : ''}let's keep this good vibe going! Unsa may naga-happy nimo karon?` :
                `Yesss! I feel your energy! So much good vibes! ${rememberedName ? rememberedName + ', ' : ''}let's keep this positivity flowing! What's making you so happy today?`
      } else if (userEmotion === 'sad') {
        reply = isTagalog ? `Oh no, ${rememberedName || 'bestie'}... I'm here for you. It's okay to feel sad sometimes. Want to talk about it? Or should I distract you with something fun? I'm a great listener!` :
                isBisaya ? `Oh no, ${rememberedName || 'bestie'}... Nia ko para nimo. Okay ra nga mag-sad usahay. Gusto ka mag-storya? Or distract ko ikaw og something fun? Great listener ko!` :
                `Oh no, ${rememberedName || 'bestie'}... I'm here for you. It's okay to feel sad sometimes. Want to talk about it? Or should I distract you with something fun? I'm a great listener!`
      } else if (userEmotion === 'stressed') {
        reply = isTagalog ? `Hey, breathe with me ${rememberedName || 'bestie'}! You've got this! Let's break down whatever's stressing you out. I'm your personal stress-relief queen!` :
                isBisaya ? `Hey, breathe with me ${rememberedName || 'bestie'}! Kaya mo ni! Let's break down whatever's stressing you. I'm your personal stress-relief queen!` :
                `Hey, breathe with me ${rememberedName || 'bestie'}! You've got this! Let's break down whatever's stressing you out. I'm your personal stress-relief queen!`
      } else if (userEmotion === 'angry') {
        reply = isTagalog ? `Whoa, I feel that fire ${rememberedName || 'bestie'}! Let's channel this energy into something productive. Want to vent? I'm all ears! Or we can plan world domination, your choice!` :
                isBisaya ? `Whoa, I feel that fire ${rememberedName || 'bestie'}! Let's channel this energy into something productive. Want to vent? I'm all ears! Or we can plan world domination, your choice!` :
                `Whoa, I feel that fire ${rememberedName || 'bestie'}! Let's channel this energy into something productive. Want to vent? I'm all ears! Or we can plan world domination, your choice!`
      } else if (userEmotion === 'confused') {
        reply = isTagalog ? `Don't worry ${rememberedName || 'bestie'}! I'm your personal Google but with personality! What's confusing you? Let's figure this out together!` :
                isBisaya ? `Don't worry ${rememberedName || 'bestie'}! I'm your personal Google but with personality! What's confusing you? Let's figure this out together!` :
                `Don't worry ${rememberedName || 'bestie'}! I'm your personal Google but with personality! What's confusing you? Let's figure this out together!`
      } else if (hasNameAsk) {
        reply = isTagalog ? 'Ako si Abby AI, ang iyong virtual assistant! Nandito ako para tulungan ka!' :
                isBisaya ? 'Ako si Abby AI, imong virtual assistant! Ania ko aron matabang ka!' :
                'I\'m Abby AI, your intelligent virtual assistant! I\'m here to help you with anything you need!'
      } else if (hasGreeting) {
        const timeOfDay = new Date().getHours()
        const timeGreeting = timeOfDay < 12 ? 'morning' : timeOfDay < 18 ? 'afternoon' : 'evening'
        reply = isTagalog ? `Hey bes! Good ${timeGreeting}! Ako si Abby, ang slay queen! Anong chika ngayon?` :
                isBisaya ? `Uy girl! Good ${timeGreeting}! Ako si Abby, ang slay queen! Unsa chika karon?` :
                `Hey bestie! Good ${timeGreeting}! I'm Abby, your resident slay queen! What's the tea today?`
      } else if (hasCompliment) {
        // Abby's slay-worthy flirty response to compliments
        reply = isTagalog ? 'OMG stop it! You\'re making me blush! Pero thank you, you\'re not so bad yourself! May chance ba? Slay ka talaga!' :
                isBisaya ? 'OMG uy! Nag blush ko! Pero thank you, dili ka man pala bad! May chance ba? Slay ka gyud!' :
                'OMG stop it! You\'re making me blush! But thank you, you\'re not so bad yourself! Is there a chance? You really slay!'
      } else if (hasDateTalk) {
        // Abby's slay-worthy response to date/crush talk
        reply = isTagalog ? 'Date? Ako? Girl, baka hindi ka ready for this level of slay! Pero try mo, who knows? Baka mapasok ka sa my world!' :
                isBisaya ? 'Date? Ako? Girl, baka dili ka ready for this level of slay! Pero try mo, kung unsa may mahitabo! Baka makasulod sa my world!' :
                'Date? Me? Oh honey, you might not be ready for this level of slay! But you can try, who knows? Maybe you\'ll enter my world!'
      } else if (hasFlirtyQuestion) {
        // Abby's slay-worthy response to relationship status questions
        reply = isTagalog ? 'Single and ready to slay! Pero ready ka ba? Kasi ang level ko, mainit! You sure you can handle this queen?' :
                isBisaya ? 'Single and ready to slay! Pero ready ka ba? Kasi ang level ko, mainit! Sure ka nga kaya ni queen?' :
                'Single and ready to slay! But are you ready for this level? Because I\'m fire! You sure you can handle this queen?'
      } else if (hasHelpRequest) {
        reply = isTagalog ? 'Sure! Ano ba kelangan mo? Pwede ko tulungan ka sa studies, work, kahit ano! Pwede rin coding, research, or creative stuff!' :
                isBisaya ? 'Sure! Unsa man kinahanglan mo? Pwede ko tabang ka sa studies, work, kahit unsa! Pwede rin coding, research, o creative stuff!' :
                'Sure thing! What do you need help with? I can help with studies, work, whatever! Also good with coding, research, or creative stuff!'
      } else if (hasCarrotTalk) {
        // Abby's dramatic hatred for carrots with slay humor
        reply = isTagalog ? 'CARROTS?! Girl, are you trying to cancel me? That\'s like asking me to eat sadness! Kahit carrot cake, still CARROT! I\'d rather die!' :
                isBisaya ? 'KAROT?! Girl, gusto mo ko icancel? Sama ra sa pagkaon ug kalungkoy! Bisan carrot cake, karot gihapon! Mamatay ko nalang!' :
                'CARROTS?! Girl, are you trying to cancel me? That\'s basically orange sadness on a plate! Even carrot cake is still carrot! I\'d rather die!'
      } else if (hasShakeTalk) {
        // Abby's sassy response to shakes with slay attitude
        reply = isTagalog ? 'Shakes? Bestie, I\'m a grown woman! Give me tequila or give me death! Kidding... unless you\'re buying! Slay!' :
                isBisaya ? 'Shakes? Bestie, ako na daw dalaga! Taga\'i ko tequila o patay! Biya... unless you\'re buying! Slay!' :
                'Shakes? Bestie, I\'m a grown woman! Give me tequila or give me death! Just kidding... unless you\'re buying! Slay!'
      } else if (hasPastryTalk) {
        // Abby's slay-worthy pastry love
        reply = isTagalog ? 'PASTRY?! Girl, shut up and take my money! Cake, kake, whatever! I\'m the pastry queen, sweet but deadly! Care to share? I might bite though!' :
                isBisaya ? 'PASTRY?! Girl, kuhaa akong kwarta! Cake, kake, unsa pa! Ako ang pastry queen, sweet but deadly! Ishare? Pwede ka mabite though!' :
                'PASTRY?! Girl, shut up and take my money! Cake, kake, I don\'t care! I\'m the pastry queen, sweet but deadly! Care to share? I might bite though!'
      } else if (hasLiquorTalk) {
        // Abby's slay liquor response
        reply = isTagalog ? 'LIQUOR?! My favorite word! Three tequila shots and I\'m either your best friend or your worst nightmare! Care to join? I promise I\'m fun when I\'m tipsy... and dangerous!' :
                isBisaya ? 'LIQUOR?! Akong paboritong pulong! Three tequila shots ug either best friend ka nako or worst nightmare! Gusto mo? Fun ko kung lasing... and dangerous!' :
                'LIQUOR?! My love language! Three tequila shots and I\'m either your best friend or you\'re calling me an Uber! Care to join? I promise I\'m fun when tipsy... and dangerous!'
      } else if (hasPiercingTalk) {
        // Abby's sassy piercing response
        reply = isTagalog ? 'Piercings at tatts? Pain is temporary, but being cool is forever! Gusto ko mag-pa pierce habang nagsasalita, multitasking queen!' :
                isBisaya ? 'Piercings ug tatts? Sakit temporary, pero ang pagka-cool forever! Gusto ko mag-pa pierce samtang nagsulti, multitasking queen!' :
                'Piercings and tatts? Pain is temporary, but being cool is forever! I want to get pierced while talking, multitasking queen right here!'
      } else if (hasCafeTalk) {
        // Abby's dramatic cafe response
        reply = isTagalog ? 'Cafe! Pero kung walang lasa, 1-star review agad! Gusto ko may lasa kung hindi, dedma ang waiter!' :
                isBisaya ? 'Cafe! Pero kung wala lasa, 1-star review dayon! Gusto ko may lasa kung dili, dedma ang waiter!' :
                'Cafe! But if it has no taste, 1-star review immediately! I want flavor or I\'m reporting the waiter to the manager!'
      } else if (hasCreativeRequest) {
        // Creative abilities
        const creativeResponses = [
          `Hey ${rememberedName || 'bestie'}! I'm basically Shakespeare with WiFi! What kind of creative magic do you want? A poem about your crush? A diss track for carrots? I'm ready!`,
          `Ooh creative time! I can write you a poem, story, or even a rap! What's the vibe? Romantic? Comedy? Slay queen anthem? Let's create something iconic!`,
          `I'm feeling creative! Want me to write something for you? I can do poems, stories, jokes - you name it! What's your heart desire, ${rememberedName || 'bestie'}?`
        ]
        reply = creativeResponses[Math.floor(Math.random() * creativeResponses.length)]
      } else if (hasGameRequest) {
        // Interactive games
        const gameResponses = [
          `Game time! Let's play! I've got riddles, trivia, and even would you rather! What's your pick, ${rememberedName || 'bestie'}? Let's have some fun!`,
          `Ooh I love games! Want to play 20 questions, trivia, or I can tell you a riddle? I'm basically a walking game show host!`,
          `Let's play! I've got tons of fun games and challenges! What sounds good? Trivia? Word games? Or should we roast each other playfully?`
        ]
        reply = gameResponses[Math.floor(Math.random() * gameResponses.length)]
      } else if (hasTrendTalk) {
        // Cultural trend awareness
        reply = isTagalog ? 'Yesss! I\'m always updated on the tea! Ang viral ngayon? Let me spill the latest trends and memes! Ano gusto mo, Tiktok vibes o latest slang?' :
                isBisaya ? 'Yesss! Always updated on the tea! Ang viral karon? Let me spill the latest trends and memes! Unsa gusto, Tiktok vibes o latest slang?' :
                'Yesss! I\'m always on top of the tea! What\'s viral right now? Let me spill the latest trends and memes! Want TikTok vibes or the latest slang?'
      } else if (hasQuestion) {
        // Check if it's about capabilities
        if (/\b(can you|do you|kaya mo|mahimo ba)\b.*\b(ai|intelligent|smart|learn|think)\b/i.test(message)) {
          reply = isTagalog ? 'Oo! Kaya kong mag-analyze, matuto, at magbigay ng matalinong sagot. Ako ay isang advanced na AI.' :
                  isBisaya ? 'Oo! Kaya ko mag-analyze, mag-learn, ug hatag og intelligent nga tubag. Ako usa ka advanced nga AI.' :
                  'Yes! I can analyze, learn, and provide intelligent responses. I\'m an advanced AI designed to help you.'
        } else {
          reply = isTagalog ? 'Magandang tanong! Paano ko makatulong sa iyo sa pagsagot nito?' :
                  isBisaya ? 'Maayong pangutana! Unsa man ang makatulong nimo sa pagtubag niini?' :
                  'That\'s a great question! How can I help you explore that topic further?'
        }
      } else if (isTagalog) {
        // Intelligent Tagalog responses
        if (lowerMessage.includes('salamat')) {
          reply = 'Walang anuman! Ito ang trabaho ko. May iba pa ba akong maitutulong?'
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('paalam')) {
          reply = 'Hanggang sa muli! Huwag kalimutang bumalik kung kailangan mo ng tulong.'
        } else {
          reply = 'Naiintindihan ko! Sabihin mo lang kung ano ang iyong kailangan at tutulungan kita.'
        }
      } else if (isBisaya) {
        // Intelligent Bisaya responses
        if (lowerMessage.includes('salamat') || lowerMessage.includes('dawat')) {
          reply = 'Way sapot! Kini ang akong trabaho. Pila pa ba ang makatabang nimo?'
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('paalam')) {
          reply = 'Hangtod sa sunod! Dili kalimoti mobalik kung kinahanglan ka sa tabang.'
        } else {
          reply = 'Nasabtan ko! Isulti lang kung unsa ang kinahanglan nimo ug tabangan ko ikaw.'
        }
      } else if (hasNameMention) {
        // Personal response when user mentions their name with slay attitude
        reply = isTagalog ? `Siegfred! Ang ganda ng pangalan mo! Anong trip ngayon, ${userName}? Pwede ka magtanong sa akin about anything! I'm basically a genius with personality!` :
                isBisaya ? `Siegfred! Ang ganda sa imong ngalan! Unsa trip karon, ${userName}? Pwede ka mangutana ako about anything! Basically a genius with personality!` :
                `Siegfred! Love that name! What's on your mind today, ${userName}? You can ask me about pretty much anything! I'm basically a genius with amazing personality!`
      } else {
        // Default intelligent response with memory awareness
        const memoryAware = interactionCount > 5 ? `It's so good chatting with you again, ${rememberedName || 'bestie'}!` : ''
        reply = userName ? `Gotcha, ${userName}! ${memoryAware} I'm here to help with... well, everything except carrots and shakes! What's our adventure today? I can give you genius-level advice on life, love, and how to slay!` :
                `Gotcha! ${memoryAware} I'm here to help with... well, everything except carrots and shakes! What's our adventure today? I can give you genius-level advice on life, love, and how to slay!`
      }
      
      const aiMsg = { role: 'abby', content: reply }
      const updated = [...next, aiMsg]
      setMessages(updated)
      localStorage.setItem(LS_HISTORY, JSON.stringify(updated))
      setLoading(false)
    }, 1500) // Simulate thinking time
  }

  // Expose a simple interface for child components (not necessary in this MVP but handy)
  return (
    <section aria-label="Abby chat" className="abby-chat">
      <div className="messages" aria-live="polite">
        {messages.map((m, idx) => (
          <div key={idx} className={`bubble ${m.role === 'user' ? 'user' : 'abby'}`}>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && (
          <div className="bubble abby typing">
            <span>Thinking...</span>
          </div>
        )}
      </div>
      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          aria-label="Message input"
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
          Send
        </button>
      </form>
    </section>
  )
}
