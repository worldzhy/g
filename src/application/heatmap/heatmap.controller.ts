import {Controller, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {User} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {RawDataForecastService} from '../raw-data/raw-data-forecast.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {
  generateMonthlyCalendar,
  generateMonthlyTimeslots,
} from '@toolkit/utilities/datetime.util';

enum HEATMAP_TYPE {
  Availability = 1,
  Demand = 2,
}

@ApiTags('Heatmap')
@ApiBearerAuth()
@Controller('heatmap')
export class HeatmapController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly coachService: UserService,
    private readonly rawDataForecastService: RawDataForecastService
  ) {}

  @Get('forecast')
  async getForecast(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    return await this.rawDataForecastService.forecast({venueId, year, month});
  }

  @Get('')
  async getHeatmap(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('types') types: number[]
  ) {
    const hourOfOpening = 5;
    const hourOfClosure = 22;
    const minutesOfTimeslot = 30;
    const heatmapInfoTimeslots: {
      year: number;
      month: number;
      dayOfMonth: number;
      dayOfWeek: number;
      hour: number;
      minute: number;
      minutesOfTimeslot: number;
      info: {type: HEATMAP_TYPE; coaches: User[]}[];
    }[] = [];

    // [step 1] Generate monthly timeslots.
    const heatmapTimeslots = generateMonthlyTimeslots({
      year,
      month,
      hourOfOpening,
      hourOfClosure,
      minutesOfTimeslot,
    });

    // [step 2] Get coach availability heatmap.
    if (types.includes(HEATMAP_TYPE.Availability)) {
      // [step 2-1] Get coaches in the location.
      const coaches = await this.coachService.findMany({
        where: {profile: {eventVenueIds: {has: venueId}}},
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              coachingTenure: true,
              quotaOfWeek: true,
              quotaOfWeekMinPreference: true,
              quotaOfWeekMaxPreference: true,
            },
          },
        },
      });
      const coachIds = coaches.map(coach => {
        return coach.id;
      });

      // [step 2-2] Count available coaches in each heatmap timeslot.
      for (let i = 0; i < heatmapTimeslots.length; i++) {
        const heatmapTimeslot = heatmapTimeslots[i];
        const availableCoaches: User[] = [];

        // Get {hostUserId:string, _count:{}}[]
        const groupedAvailabilityTimeslots =
          await this.availabilityTimeslotService.groupByHostUserId({
            hostUserIds: coachIds,
            venueId: venueId,
            datetimeOfStart: heatmapTimeslot.datetimeOfStart,
            datetimeOfEnd: heatmapTimeslot.datetimeOfEnd,
          });

        // Count available coaches in this heatmap timeslot.
        for (let j = 0; j < groupedAvailabilityTimeslots.length; j++) {
          const element = groupedAvailabilityTimeslots[j];
          // Check if it is seamless in the heatmap timeslot.
          // If it is seamless, then the coach is available for the heatmap timeslot.
          if (
            element._count.hostUserId ===
            minutesOfTimeslot /
              this.availabilityTimeslotService.MINUTES_Of_TIMESLOT
          ) {
            for (let p = 0; p < coaches.length; p++) {
              const coach = coaches[p];
              if (coach.id === element.hostUserId) {
                availableCoaches.push(coach);
              }
            }
          }
        }

        heatmapInfoTimeslots.push({
          year: heatmapTimeslot.year,
          month: heatmapTimeslot.month,
          dayOfMonth: heatmapTimeslot.dayOfMonth,
          dayOfWeek: heatmapTimeslot.dayOfWeek,
          hour: heatmapTimeslot.hour,
          minute: heatmapTimeslot.minute,
          minutesOfTimeslot: heatmapTimeslot.minutesOfTimeslot,
          info: [
            {
              type: HEATMAP_TYPE.Availability,
              coaches: availableCoaches,
            },
          ],
        });
      }
    }

    return {
      calendar: generateMonthlyCalendar(year, month),
      heatmap: heatmapInfoTimeslots,
    };
  }

  /* End */
}
