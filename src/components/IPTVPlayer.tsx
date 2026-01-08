import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2,
  Search,
  Tv,
  ChevronLeft,
  ChevronRight,
  Settings,
  PictureInPicture2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Channel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

interface IPTVPlayerProps {
  playlistUrl: string;
  playlistName?: string;
}

const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse channel info
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);

      currentChannel = {
        name: nameMatch ? nameMatch[1].trim() : `Canal ${channels.length + 1}`,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Geral',
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      // This is the URL line
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }

  return channels;
};

export const IPTVPlayer = ({ playlistUrl, playlistName = 'IPTV Player' }: IPTVPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos');
  const [groups, setGroups] = useState<string[]>(['Todos']);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  let controlsTimeout: NodeJS.Timeout;

  // Load playlist via proxy
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user session for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Usuário não autenticado');
        }

        // Use edge function proxy to avoid CORS
        const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iptv-proxy?url=${encodeURIComponent(playlistUrl)}`;
        
        const response = await fetch(proxyUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Falha ao carregar playlist');
        }
        
        const content = await response.text();
        const parsedChannels = parseM3U(content);
        
        if (parsedChannels.length === 0) {
          throw new Error('Nenhum canal encontrado na playlist');
        }
        
        setChannels(parsedChannels);
        setFilteredChannels(parsedChannels);
        
        // Extract unique groups
        const uniqueGroups = ['Todos', ...new Set(parsedChannels.map(c => c.group || 'Geral'))];
        setGroups(uniqueGroups);
        
        // Auto-select first channel
        setSelectedChannel(parsedChannels[0]);
      } catch (err: any) {
        console.error('Erro ao carregar playlist:', err);
        setError(err.message || 'Erro ao carregar playlist');
      } finally {
        setIsLoading(false);
      }
    };

    if (playlistUrl) {
      loadPlaylist();
    }
  }, [playlistUrl]);

  // Filter channels
  useEffect(() => {
    let filtered = channels;
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGroup !== 'Todos') {
      filtered = filtered.filter(c => c.group === selectedGroup);
    }
    
    setFilteredChannels(filtered);
  }, [searchTerm, selectedGroup, channels]);

  // Initialize HLS player
  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    setIsBuffering(true);
    setError(null);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hlsRef.current = hls;
      hls.loadSource(selectedChannel.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(() => {});
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Erro de rede. Tentando reconectar...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Erro de mídia. Tentando recuperar...');
              hls.recoverMediaError();
              break;
            default:
              setError('Erro ao reproduzir canal');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = selectedChannel.url;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        video.play().catch(() => {});
      });
    } else {
      setError('Navegador não suporta reprodução HLS');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [selectedChannel]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, [isFullscreen]);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP not supported');
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const selectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const navigateChannel = (direction: 'prev' | 'next') => {
    if (!selectedChannel) return;
    
    const currentIndex = filteredChannels.findIndex(c => c.url === selectedChannel.url);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex < 0) newIndex = filteredChannels.length - 1;
    if (newIndex >= filteredChannels.length) newIndex = 0;
    
    setSelectedChannel(filteredChannels[newIndex]);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'p':
          togglePiP();
          break;
        case 'arrowup':
          e.preventDefault();
          navigateChannel('prev');
          break;
        case 'arrowdown':
          e.preventDefault();
          navigateChannel('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, togglePiP, selectedChannel, filteredChannels]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-card rounded-2xl border border-border">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando playlist...</p>
        </div>
      </div>
    );
  }

  if (error && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-card rounded-2xl border border-border">
        <div className="text-center">
          <Tv className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Erro ao carregar</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex bg-background rounded-2xl overflow-hidden border border-border",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[600px]"
      )}
    >
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20 lg:hidden",
          showSidebar && "hidden"
        )}
        onClick={() => setShowSidebar(true)}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Channel Sidebar */}
      <div 
        className={cn(
          "w-80 bg-card border-r border-border flex flex-col transition-all duration-300",
          "absolute lg:relative z-20 h-full lg:translate-x-0",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">{playlistName}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowSidebar(false)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Group filter */}
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {groups.map(group => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGroup(group)}
                  className="shrink-0"
                >
                  {group}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChannels.map((channel, index) => (
              <button
                key={`${channel.url}-${index}`}
                onClick={() => selectChannel(channel)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  selectedChannel?.url === channel.url
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-muted"
                )}
              >
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name}
                    className="w-10 h-10 rounded object-cover bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).className = 'hidden';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Tv className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">{channel.group}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          {filteredChannels.length} canais
        </div>
      </div>

      {/* Video Player */}
      <div 
        className="flex-1 relative bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={togglePlay}
        />

        {/* Buffering Overlay */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Channel Info Overlay */}
        {selectedChannel && showControls && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="font-medium text-white">{selectedChannel.name}</p>
            <p className="text-xs text-white/70">{selectedChannel.group}</p>
          </div>
        )}

        {/* Controls */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateChannel('prev')}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateChannel('next')}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-primary"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className="text-white hover:bg-white/20 hidden sm:flex"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPTVPlayer;
