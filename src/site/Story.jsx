import SectionHead from "./SectionHead";
import { Fade } from "./Motion";

const ph = n => `/photos/${n}-sm.webp`;
const CHAPTERS = [
    { year: "2018", place: "Cooch Behar, West Bengal", title: "B.Tech, Computer Science", text: "Four years of algorithms, systems and late nights — graduated with an 8.73 / 10 CGPA, as a teaching assistant and student-council member.", photos: [43, 17, 47] },
    { year: "2022", place: "West Bengal", title: "The planning year", text: "Language classes, applications, and long walks photographing the streets I was about to leave.", photos: [45, 14, 20] },
    { year: "2023", place: "7,004 km", title: "One-way ticket", text: "Twenty-two, alone, one suitcase. Everything I knew on one side of the arc; everything I wanted on the other." },
    { year: "2023", place: "Hamburg, Germany", title: "M.Sc. Data Science, TUHH", text: "Machine learning, big data and statistics — in a new country and a new language.", photos: [26, 35, 36] },
    { year: "2025", place: "Nordex Group, Hamburg", title: "Enterprise data & AI", text: "Built an AI assistant, designed an AI governance lifecycle, worked on Databricks pipelines — and led an AI project to its deadline." },
    { year: "Now", place: "Hamburg", title: "Building Argus AI", text: "An EU AI Act compliance platform, built on the side. And still, always, carrying a camera.", photos: [52, 34, 41] },
];

export default function Story() {
    return (
        <section id="story" className="act wrap story" data-shape="map" data-side="right">
            <SectionHead n="06" kicker="My story" title="From West Bengal to Hamburg" sub="The particles are drawing the 7,004 km I travelled. Scroll through the chapters." />
            <ol className="chapters">
                {CHAPTERS.map((c, i) => (
                    <Fade as="li" key={c.year + c.title} className="chapter neu" style={{ "--i": i }}>
                        <div className="card-top"><span className="card-year">{c.year}</span><span className="chip mono">{c.place}</span></div>
                        <h3>{c.title}</h3>
                        <p>{c.text}</p>
                        {c.photos && <div className="q-photos">{c.photos.map((n, k) => <img key={n} src={ph(n)} alt="" loading="lazy" style={{ "--r": `${[-5, 3, -2][k]}deg` }} />)}</div>}
                    </Fade>
                ))}
            </ol>
        </section>
    );
}
