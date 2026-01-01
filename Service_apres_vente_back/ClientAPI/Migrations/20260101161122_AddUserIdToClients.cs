using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClientAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToClients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "Id",
                keyValue: 1,
                column: "DateInscription",
                value: new DateTime(2026, 1, 1, 17, 11, 20, 854, DateTimeKind.Local).AddTicks(3293));

            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "Id",
                keyValue: 2,
                column: "DateInscription",
                value: new DateTime(2026, 1, 1, 17, 11, 20, 854, DateTimeKind.Local).AddTicks(3321));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "Id",
                keyValue: 1,
                column: "DateInscription",
                value: new DateTime(2025, 12, 30, 1, 25, 50, 124, DateTimeKind.Local).AddTicks(5117));

            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "Id",
                keyValue: 2,
                column: "DateInscription",
                value: new DateTime(2025, 12, 30, 1, 25, 50, 124, DateTimeKind.Local).AddTicks(5196));
        }
    }
}
