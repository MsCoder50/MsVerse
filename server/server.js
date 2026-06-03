import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express();
const port = process.env.PORT || 3000;


app.use(cors())

// Helper: strip bitrate tags and extra suffixes from filenames
function cleanTitle(filename) {
    return filename
        .replace(/\.mp3$/i, '')           // remove extension
        .replace(/\s*\d{2,3}\s*[Kk]bps/g, '') // remove "320 Kbps", "128Kbps" etc.
        .replace(/\s{2,}/g, ' ')          // collapse double spaces
        .trim();
}


app.get('/stream/:playlist/:file',(req,res)=>{
    const path = `./tracks/${req.params.playlist}/${req.params.file}`;
    if (!fs.existsSync(path)) return res.status(404).send("File not found");
    const metadata = fs.statSync(path);
    const range = req.headers.range;
    if(!range){
        return res.status(400).send("Required Range Header.")
    }

    const CHUNK_SIZE = 10 ** 6;
    const parts = range.replace(/bytes=/,"").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : metadata.size - 1;

    const stream = fs.createReadStream(path, { start, end });

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${metadata.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "audio/mpeg",
    });

    stream.pipe(res);
})

app.get("/playlist",(req,res)=>{
    const dir = fs.readdirSync("./tracks");
    res.json(dir);
})  
app.get("/tracks/:id",(req,res)=>{
    const path = `./tracks/${req.params.id}`;
    const data = fs.statSync(path);
    res.json({
        title:path
    })
})

app.get("/api/playlists", (req, res) => {
    try {
        const items = fs.readdirSync("./tracks", { withFileTypes: true });
        const playlists = items
            .filter(item => item.isDirectory())
            .map(dir => {
                const songs = fs.readdirSync(`./tracks/${dir.name}`).filter(f => f.endsWith('.mp3'));
                const imgName = dir.name.toLowerCase();
                const coverImage = fs.existsSync(`../img/${imgName}.png`) ? `img/${imgName}.png` : "img/sam.jpg";
                return {
                    id: dir.name,
                    name: dir.name,
                    author: "Local",
                    totalSongs: songs.length,
                    coverImage: coverImage
                };
            });
        res.json(playlists);
    } catch (e) {
        res.json([]);
    }
});

app.get("/api/playlists/:id/tracks", (req, res) => {
    try {
        const playlistId = req.params.id;
        const songs = fs.readdirSync(`./tracks/${playlistId}`).filter(f => f.endsWith('.mp3'));
        const tracks = songs.map((file, index) => ({
            id: index + 1,
            title: cleanTitle(file),
            duration: "Unknown",
            file: `${playlistId}/${file}`
        }));
        res.json(tracks);
    } catch (e) {
        res.json([]);
    }
})
app.get('/health',(req,res)=>{
    res.json(`Server Running on ${port}`);
})

app.listen(port,()=>{
    const dir = fs.readdirSync("./tracks");
    console.log(dir);
    console.log(`server running on port ${port}`);
})