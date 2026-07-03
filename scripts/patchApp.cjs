const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Load text files
const newHubCode = fs.readFileSync(path.join(__dirname, 'newHubCode.txt'), 'utf8');
const newMatCode = fs.readFileSync(path.join(__dirname, 'newMatCode.txt'), 'utf8');

// 1. Replace StudentHubScreen definition
const startHubPattern = 'interface StudentHubProps {';
const endHubPattern = '// ─── DECK BUILDER SCREEN ──────────────────────────────────────────────────────';

const startIndexHub = content.indexOf(startHubPattern);
const endIndexHub = content.indexOf(endHubPattern);

if (startIndexHub === -1 || endIndexHub === -1) {
  console.error("Could not find StudentHubScreen boundaries!");
  process.exit(1);
}

content = content.substring(0, startIndexHub) + newHubCode + content.substring(endIndexHub);

// 2. Replace GameMatProps and GameMatScreen
const startGameMatPattern = 'interface GameMatProps {';
const endGameMatPattern = '// ─── TEACHER VERIFY PIN SCREEN ────────────────────────────────────────────────';

const startIndexMat = content.indexOf(startGameMatPattern);
const endIndexMat = content.indexOf(endGameMatPattern);

if (startIndexMat === -1 || endIndexMat === -1) {
  console.error("Could not find GameMatScreen boundaries!");
  process.exit(1);
}

content = content.substring(0, startIndexMat) + newMatCode + content.substring(endIndexMat);

// 3. Replace state switch case rendering in root App
const targetSwitch = `      case "student-hub":
        return (
          <StudentHubScreen
            onNavigate={setScreen}
            profile={profile}
            setProfile={setProfile}
            codes={codes}
            setCodes={setCodes}
            catalog={catalog}
          />
        );`;

const newSwitch = `      case "student-hub":
        return (
          <StudentHubScreen
            onNavigate={setScreen}
            profile={profile}
            setProfile={setProfile}
            codes={codes}
            setCodes={setCodes}
            catalog={catalog}
            history={matchHistory}
            onZoomCard={setZoomedCard}
          />
        );`;

content = content.replace(targetSwitch, newSwitch);

const targetSwitchMat = `      case "game-mat":
        return (
          <GameMatScreen
            onNavigate={setScreen}
            profile={profile}
            setProfile={setProfile}
            catalog={catalog}
            setMatchHistory={setMatchHistory}
          />
        );`;

const newSwitchMat = `      case "game-mat":
        return (
          <GameMatScreen
            onNavigate={setScreen}
            profile={profile}
            setProfile={setProfile}
            catalog={catalog}
            setMatchHistory={setMatchHistory}
            onZoomCard={setZoomedCard}
            showToast={showToast}
          />
        );`;

content = content.replace(targetSwitchMat, newSwitchMat);

// 4. Add zoomedCard and toast states inside export default function App()
const startAppPattern = 'export default function App() {';
const indexAppStart = content.indexOf(startAppPattern);
if (indexAppStart === -1) {
  console.error("Could not find export default function App()!");
  process.exit(1);
}

const slicePoint = indexAppStart + startAppPattern.length;
const appStates = `
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  };
`;

// Check if appStates are already in file
if (content.indexOf('const [zoomedCard, setZoomedCard]') === -1) {
  content = content.slice(0, slicePoint) + appStates + content.slice(slicePoint);
}

// 5. Add overlay render for Zoom Modal & Toast at the end of App's return
const endReturnPattern = '        {/* Navigation tabs for presentation/grading */}';
const targetReturnIndex = content.lastIndexOf(endReturnPattern);

if (targetReturnIndex === -1) {
  console.error("Could not find App return render end!");
  process.exit(1);
}

const overlays = `
        {/* Zoom Modal overlay */}
        {zoomedCard && (
          <div 
            onClick={() => setZoomedCard(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer animate-fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-[#150f35] border-2 border-purple-500 rounded-3xl p-5 w-[240px] shadow-2xl flex flex-col items-center text-center gap-3 relative animate-scale-up cursor-default"
            >
              <button 
                onClick={() => setZoomedCard(null)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 hover:text-white"
              >
                ×
              </button>
              
              {/* Card visual detail */}
              <div className="scale-110 py-1">
                <FullCard card={zoomedCard} onZoom={() => {}} />
              </div>
              
              <div className="w-full mt-2">
                <h4 className="font-['Nunito'] font-black text-white text-base leading-tight">{zoomedCard.name}</h4>
                <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-widest font-black">{zoomedCard.type} · {zoomedCard.rarity}</p>
                <div className="bg-[#1c1845] border border-purple-900/40 rounded-xl p-2.5 mt-3 text-left">
                  <p className="text-[9px] text-purple-200 italic leading-relaxed">
                    {zoomedCard.ability || "Esta carta representa una palabra de vocabulario en inglés. ¡Mantén presionada la carta para escuchar su pronunciación!"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => speakWord(zoomedCard.name)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-['Nunito'] font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Volume2 size={13} /> Escuchar Vocabulario
              </button>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-955/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs z-[120] shadow-lg pointer-events-none animate-bounce font-sans font-bold">
            {toast}
          </div>
        )}
`;

if (content.indexOf('{zoomedCard && (') === -1) {
  content = content.slice(0, targetReturnIndex) + overlays + content.slice(targetReturnIndex);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("App.tsx patched successfully!");
