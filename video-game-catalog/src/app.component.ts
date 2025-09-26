
import { Component, signal, computed, effect, viewChild, ElementRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from './game.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const INITIAL_GAMES: Game[] = [
  { id: 1, title: 'The Witcher 3: Wild Hunt', genre: 'RPG', platform: 'PC', score: 10, releaseYear: 2015 },
  { id: 2, title: 'Red Dead Redemption 2', genre: 'Aventura', platform: 'PlayStation', score: 9, releaseYear: 2018 },
  { id: 3, title: 'Halo: Combat Evolved', genre: 'Acción', platform: 'Xbox', score: 9, releaseYear: 2001 },
  { id: 4, title: 'The Legend of Zelda: Breath of the Wild', genre: 'Aventura', platform: 'Nintendo Switch', score: 10, releaseYear: 2017 },
];

const EMPTY_GAME: Game = {
  id: null,
  title: '',
  genre: '',
  platform: '',
  score: null,
  releaseYear: null
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class AppComponent implements AfterViewInit {
  // Signals for state management
  games = signal<Game[]>(INITIAL_GAMES);
  searchTerm = signal<string>('');
  selectedGameId = signal<number | null>(null);

  // Form model
  formModel = signal<Game>({ ...EMPTY_GAME });

  // Computed signals
  filteredGames = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.games();
    }
    return this.games().filter(
      game => game.title.toLowerCase().includes(term) || game.genre.toLowerCase().includes(term)
    );
  });
  isEditing = computed(() => this.formModel().id !== null);

  // Chart.js setup
  statsCanvas = viewChild<ElementRef<HTMLCanvasElement>>('gameStatsCanvas');
  private chart: Chart | null = null;

  genres: Game['genre'][] = ['RPG', 'Acción', 'Aventura', 'Estrategia', 'Deportes'];
  platforms: Game['platform'][] = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
  scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor() {
    effect(() => {
      // This effect will run whenever the games signal changes, keeping the chart in sync.
      if (this.statsCanvas()) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit(): void {
    // Initial chart draw
    if (this.statsCanvas()) {
      this.updateChart();
    }
  }

  selectGame(game: Game): void {
    this.selectedGameId.set(game.id);
    this.formModel.set({ ...game });
  }

  clearForm(): void {
    this.formModel.set({ ...EMPTY_GAME });
    this.selectedGameId.set(null);
  }

  saveGame(): void {
    const gameData = this.formModel();

    // Form Validation
    if (!this.validateForm(gameData)) {
        return;
    }

    if (this.isEditing()) {
      // Update
      this.games.update(games =>
        games.map(g => (g.id === gameData.id ? gameData : g))
      );
    } else {
      // Create
      const newId = Math.max(...this.games().map(g => g.id || 0)) + 1;
      if (this.games().some(g => g.id === gameData.id)) {
        alert('Error: Ya existe un juego con ese ID.');
        return;
      }
      const newGame = { ...gameData, id: gameData.id || newId }; // Use provided ID if valid, else generate
      this.games.update(games => [...games, newGame]);
    }
    this.clearForm();
  }
  
  validateForm(game: Game): boolean {
    if (!game.title || !game.genre || !game.platform || !game.score || !game.releaseYear || !game.id) {
        alert('Todos los campos son requeridos, incluyendo el ID.');
        return false;
    }
    if (isNaN(game.id) || game.id <= 0) {
        alert('El ID debe ser un número positivo.');
        return false;
    }
    if (isNaN(game.releaseYear) || String(game.releaseYear).length !== 4) {
        alert('El año de lanzamiento debe ser un número de 4 dígitos.');
        return false;
    }
    return true;
  }

  deleteGame(): void {
    const gameId = this.formModel().id;
    if (gameId === null) {
      alert('Por favor, selecciona un juego para eliminar.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este juego?')) {
      this.games.update(games => games.filter(g => g.id !== gameId));
      this.clearForm();
    }
  }

  exportToJson(): void {
    const dataStr = JSON.stringify(this.games(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'videojuegos.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
  
  private updateChart(): void {
    const canvas = this.statsCanvas()?.nativeElement;
    if (!canvas) return;

    const platformCounts: { [key: string]: number } = {};
    this.platforms.forEach(p => platformCounts[p] = 0);

    this.games().forEach(game => {
      if (game.platform) {
        platformCounts[game.platform]++;
      }
    });

    const chartData = {
      labels: Object.keys(platformCounts),
      datasets: [{
        label: 'Nº de Juegos por Plataforma',
        data: Object.values(platformCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // blue-500
          'rgba(34, 197, 94, 0.7)',   // green-500
          'rgba(239, 68, 68, 0.7)',   // red-500
          'rgba(168, 85, 247, 0.7)',  // purple-500
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
      }]
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Juegos por Plataforma',
            color: '#E5E7EB', // gray-200
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#9CA3AF', // gray-400
              stepSize: 1
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#D1D5DB' // gray-300
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}
